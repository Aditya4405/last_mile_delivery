package com.lastmiletracker.order.service;

import com.lastmiletracker.agent.entity.AgentLocation;
import com.lastmiletracker.agent.entity.DeliveryAgent;
import com.lastmiletracker.agent.repository.AgentLocationRepository;
import com.lastmiletracker.agent.repository.DeliveryAgentRepository;
import com.lastmiletracker.area.entity.Area;
import com.lastmiletracker.area.repository.AreaRepository;
import com.lastmiletracker.exception.BadRequestException;
import com.lastmiletracker.exception.ForbiddenException;
import com.lastmiletracker.exception.ResourceNotFoundException;
import com.lastmiletracker.order.dto.*;
import com.lastmiletracker.order.entity.Order;
import com.lastmiletracker.order.entity.OrderStatus;
import com.lastmiletracker.order.mapper.OrderMapper;
import com.lastmiletracker.order.repository.OrderRepository;
import com.lastmiletracker.ratecard.entity.CardType;
import com.lastmiletracker.tracking.entity.TrackingHistory;
import com.lastmiletracker.tracking.repository.TrackingHistoryRepository;
import com.lastmiletracker.tracking.service.TrackingSocketService;
import com.lastmiletracker.user.entity.Role;
import com.lastmiletracker.user.entity.User;
import com.lastmiletracker.user.repository.UserRepository;
import com.lastmiletracker.util.LocationUtils;
import com.lastmiletracker.zone.entity.Zone;
import com.lastmiletracker.zone.repository.ZoneRepository;
import com.lastmiletracker.notification.service.NotificationService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final DeliveryAgentRepository agentRepository;
    private final AreaRepository areaRepository;
    private final ZoneRepository zoneRepository;
    private final TrackingHistoryRepository trackingHistoryRepository;
    private final RateCalculationService calculationService;
    private final OrderMapper orderMapper;
    private final NotificationService notificationService;
    private final AgentLocationRepository agentLocationRepository;
    private final TrackingSocketService trackingSocketService;
    private final com.lastmiletracker.setting.service.SystemSettingService systemSettingService;
    
    private final SecureRandom random = new SecureRandom();

    public OrderService(
            OrderRepository orderRepository,
            UserRepository userRepository,
            DeliveryAgentRepository agentRepository,
            AreaRepository areaRepository,
            ZoneRepository zoneRepository,
            TrackingHistoryRepository trackingHistoryRepository,
            RateCalculationService calculationService,
            OrderMapper orderMapper,
            NotificationService notificationService,
            AgentLocationRepository agentLocationRepository,
            TrackingSocketService trackingSocketService,
            com.lastmiletracker.setting.service.SystemSettingService systemSettingService) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.agentRepository = agentRepository;
        this.areaRepository = areaRepository;
        this.zoneRepository = zoneRepository;
        this.trackingHistoryRepository = trackingHistoryRepository;
        this.calculationService = calculationService;
        this.orderMapper = orderMapper;
        this.notificationService = notificationService;
        this.agentLocationRepository = agentLocationRepository;
        this.trackingSocketService = trackingSocketService;
        this.systemSettingService = systemSettingService;
    }

    @Transactional
    public OrderResponse createOrder(OrderRequest request, String senderEmail) {
        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Sender user not found"));

        // System Settings dynamic validations
        Double maxWeight = systemSettingService.getSettingAsDouble("MAX_PARCEL_WEIGHT", 50.0);
        Double minWeight = systemSettingService.getSettingAsDouble("MIN_PARCEL_WEIGHT", 0.1);
        if (request.getWeight() > maxWeight) {
            throw new BadRequestException("Consignment weight exceeds maximum allowed parcel weight of " + maxWeight + " kg");
        }
        if (request.getWeight() < minWeight) {
            throw new BadRequestException("Consignment weight is below minimum allowed parcel weight of " + minWeight + " kg");
        }

        if (request.isCod()) {
            boolean codEnabled = systemSettingService.getSettingAsBoolean("ENABLE_COD", true);
            if (!codEnabled) {
                throw new BadRequestException("Cash on Delivery (COD) shipments are currently disabled by administrator");
            }
            Double maxCodAmount = systemSettingService.getSettingAsDouble("MAX_COD_AMOUNT", 50000.0);
            if (request.getCodAmount() != null && request.getCodAmount() > maxCodAmount) {
                throw new BadRequestException("COD collection amount exceeds maximum limit of " + maxCodAmount + " INR");
            }
        }

        CardType cardType = request.getCardType();

        if (cardType == null) {
            cardType = CardType.B2C;
        }

        CalculationRequest calcRequest = CalculationRequest.builder()
                .pickupPincode(request.getPickupPincode())
                .deliveryPincode(request.getDeliveryPincode())
                .weight(request.getWeight())
                .length(request.getLength())
                .breadth(request.getBreadth())
                .height(request.getHeight())
                .isCod(request.isCod())
                .codAmount(request.getCodAmount())
                .cardType(cardType)
                .build();

        CalculationResponse calcResponse = calculationService.calculate(calcRequest);

        Zone pickupZone = zoneRepository.findByName(calcResponse.getPickupZoneName())
                .orElseThrow(() -> new ResourceNotFoundException("Pickup zone not configured in database"));

        Zone deliveryZone = zoneRepository.findByName(calcResponse.getDeliveryZoneName())
                .orElseThrow(() -> new ResourceNotFoundException("Delivery zone not configured in database"));

        // Generate LM-formatted tracking number and verify uniqueness
        String trackingNumber;
        do {
            trackingNumber = generateLMTrackingNumber();
        } while (orderRepository.existsByTrackingNumber(trackingNumber));

        Order order = Order.builder()
                .trackingNumber(trackingNumber)
                .sender(sender)
                .recipientName(request.getRecipientName())
                .recipientPhone(request.getRecipientPhone())
                .pickupAddress(request.getPickupAddress())
                .pickupCity(request.getPickupCity())
                .pickupPincode(request.getPickupPincode())
                .deliveryAddress(request.getDeliveryAddress())
                .deliveryCity(request.getDeliveryCity())
                .deliveryPincode(request.getDeliveryPincode())
                .weight(request.getWeight())
                .length(request.getLength())
                .breadth(request.getBreadth())
                .height(request.getHeight())
                .volumetricWeight(calcResponse.getVolumetricWeight())
                .billableWeight(calcResponse.getBillableWeight())
                .shippingCharge(calcResponse.getTotalShippingCharge())
                .codAmount(request.getCodAmount())
                .isCod(request.isCod())
                .cardType(cardType)
                .status(OrderStatus.ORDER_CREATED)
                .pickupZone(pickupZone)
                .deliveryZone(deliveryZone)
                .calculationDetails(calcResponse.getCalculationDetails())
                .build();

        Order savedOrder = orderRepository.save(order);

        // Save Tracking History
        TrackingHistory history = TrackingHistory.builder()
                .order(savedOrder)
                .status(OrderStatus.ORDER_CREATED)
                .location("Order Booking Hub")
                .remarks("Order registered successfully. System reference created.")
                .updatedBy(sender)
                .build();
        trackingHistoryRepository.save(history);

        // Send Notification
        notificationService.sendNotification(
                sender,
                "Order Created",
                "Your delivery request has been booked successfully. Tracking Number: " + savedOrder.getTrackingNumber()
        );

        // WebSocket broadcast
        trackingSocketService.broadcastStatus(savedOrder.getTrackingNumber(), OrderStatus.ORDER_CREATED.name(), savedOrder.getId());

        log.info("Order Created successfully: trackingNumber={}", savedOrder.getTrackingNumber());
        return orderMapper.toResponse(savedOrder);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id, User user) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));

        // Enforce role-based access checks
        if (user.getRole() == Role.CUSTOMER && !order.getSender().getEmail().equals(user.getEmail())) {
            throw new ForbiddenException("Access Denied: You can only view your own orders.");
        }
        if (user.getRole() == Role.DELIVERY_AGENT && (order.getAssignedAgent() == null 
                || !order.getAssignedAgent().getUser().getEmail().equals(user.getEmail()))) {
            throw new ForbiddenException("Access Denied: You can only view orders assigned to you.");
        }

        return orderMapper.toResponse(order);
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderByTrackingNumber(String trackingNumber, User user) {
        Order order = orderRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with tracking number: " + trackingNumber));

        // Enforce role-based access checks
        if (user.getRole() == Role.CUSTOMER && !order.getSender().getEmail().equals(user.getEmail())) {
            throw new ForbiddenException("Access Denied: You can only view your own orders.");
        }
        if (user.getRole() == Role.DELIVERY_AGENT && (order.getAssignedAgent() == null 
                || !order.getAssignedAgent().getUser().getEmail().equals(user.getEmail()))) {
            throw new ForbiddenException("Access Denied: You can only view orders assigned to you.");
        }

        return orderMapper.toResponse(order);
    }

    @Transactional(readOnly = true)
    public Page<OrderResponse> getAllOrders(Pageable pageable, OrderStatus status, String search, String email, Role role) {
        Specification<Order> spec = Specification.where(null);

        if (role == Role.CUSTOMER) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("sender").get("email"), email));
        } else if (role == Role.DELIVERY_AGENT) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("assignedAgent").get("user").get("email"), email));
        }

        if (status != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("status"), status));
        }

        if (search != null && !search.isBlank()) {
            String likePattern = "%" + search.trim().toLowerCase() + "%";
            spec = spec.and((root, query, cb) -> cb.or(
                    cb.like(cb.lower(root.get("trackingNumber")), likePattern),
                    cb.like(cb.lower(root.get("recipientName")), likePattern),
                    cb.like(cb.lower(root.get("deliveryCity")), likePattern)
            ));
        }

        return orderRepository.findAll(spec, pageable).map(orderMapper::toResponse);
    }

    @Transactional
    public OrderResponse assignAgent(Long orderId, AgentAssignmentRequest request, User admin) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        if (order.getStatus() == OrderStatus.DELIVERED || order.getStatus() == OrderStatus.FAILED || order.getStatus() == OrderStatus.CANCELLED) {
            throw new BadRequestException("Cannot assign agent to a completed, failed or cancelled order");
        }

        // Validate state transition to ASSIGNED
        validateStateTransition(order.getStatus(), OrderStatus.ASSIGNED);

        DeliveryAgent assignedAgent;
        if (request.isAutoAssign()) {
            assignedAgent = findNearestAvailableAgent(order.getPickupPincode());
        } else {
            assignedAgent = agentRepository.findById(request.getAgentId())
                    .orElseThrow(() -> new ResourceNotFoundException("Delivery agent not found"));
            if (!assignedAgent.isAvailable()) {
                throw new BadRequestException("Selected agent is currently unavailable");
            }
        }

        // Release current agent if one was already assigned
        if (order.getAssignedAgent() != null) {
            DeliveryAgent currentAgent = order.getAssignedAgent();
            currentAgent.setAvailable(true);
            agentRepository.save(currentAgent);
        }

        // Reserve agent availability
        assignedAgent.setAvailable(false);
        agentRepository.save(assignedAgent);

        order.setAssignedAgent(assignedAgent);
        order.setStatus(OrderStatus.ASSIGNED);
        Order savedOrder = orderRepository.save(order);

        // Save tracking log
        TrackingHistory history = TrackingHistory.builder()
                .order(savedOrder)
                .status(OrderStatus.ASSIGNED)
                .location("Dispatch Sorting Point")
                .remarks("Assigned to delivery associate: " + assignedAgent.getUser().getFullName())
                .updatedBy(admin)
                .build();
        trackingHistoryRepository.save(history);

        // Notify customer and agent
        notificationService.sendNotification(
                order.getSender(),
                "Assigned",
                "Delivery associate " + assignedAgent.getUser().getFullName() + " has been assigned to order " + order.getTrackingNumber()
        );
        notificationService.sendNotification(
                assignedAgent.getUser(),
                "Assigned",
                "You have been assigned order: " + order.getTrackingNumber() + ". Pickup details: " + order.getPickupAddress()
        );

        // WebSocket broadcast
        trackingSocketService.broadcastStatus(savedOrder.getTrackingNumber(), OrderStatus.ASSIGNED.name(), savedOrder.getId());

        log.info("Order Assigned: trackingNumber={}, agentId={}", savedOrder.getTrackingNumber(), assignedAgent.getId());
        return orderMapper.toResponse(savedOrder);
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, OrderStatus status, String location, String remarks, User updatedBy) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        validateStateTransition(order.getStatus(), status);

        order.setStatus(status);

        if (status == OrderStatus.DELIVERED) {
            order.setDeliveredAt(LocalDateTime.now());
            if (order.getAssignedAgent() != null) {
                DeliveryAgent agent = order.getAssignedAgent();
                agent.setAvailable(true);
                agentRepository.save(agent);
            }
        } else if (status == OrderStatus.FAILED) {
            if (order.getAssignedAgent() != null) {
                DeliveryAgent agent = order.getAssignedAgent();
                agent.setAvailable(true);
                agentRepository.save(agent);
            }
        }

        Order savedOrder = orderRepository.save(order);

        // Fetch current coordinates of the assigned agent if available
        Double lat = null;
        Double lng = null;
        if (savedOrder.getAssignedAgent() != null) {
            Optional<AgentLocation> locOpt = agentLocationRepository.findByAgent(savedOrder.getAssignedAgent());
            if (locOpt.isPresent()) {
                lat = locOpt.get().getLatitude();
                lng = locOpt.get().getLongitude();
            }
        }

        // Save tracking log with coordinates
        TrackingHistory history = TrackingHistory.builder()
                .order(savedOrder)
                .status(status)
                .location(location != null ? location : "In-Transit Checkpoint")
                .remarks(remarks != null ? remarks : "Order shipment status updated to: " + status.name())
                .latitude(lat)
                .longitude(lng)
                .updatedBy(updatedBy)
                .build();
        trackingHistoryRepository.save(history);

        // Send status change notification
        String title = status.name().replace('_', ' ');
        String cleanTitle = Character.toUpperCase(title.charAt(0)) + title.substring(1).toLowerCase();
        notificationService.sendNotification(
                order.getSender(),
                cleanTitle,
                "Your order " + order.getTrackingNumber() + " status updated to: " + status.name()
        );

        // Broadcast new status automatically
        trackingSocketService.broadcastStatus(savedOrder.getTrackingNumber(), status.name(), savedOrder.getId());

        log.info("Order status updated: trackingNumber={}, status={}", savedOrder.getTrackingNumber(), status);
        return orderMapper.toResponse(savedOrder);
    }

    @Transactional
    public OrderResponse cancelOrder(Long id, User user) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));

        // Enforce customer constraints
        if (user.getRole() == Role.CUSTOMER && order.getStatus() != OrderStatus.ORDER_CREATED && order.getStatus() != OrderStatus.CONFIRMED) {
            throw new BadRequestException("Cannot cancel order that has already been dispatched.");
        }

        validateStateTransition(order.getStatus(), OrderStatus.CANCELLED);

        order.setStatus(OrderStatus.CANCELLED);
        if (order.getAssignedAgent() != null) {
            DeliveryAgent agent = order.getAssignedAgent();
            agent.setAvailable(true);
            agentRepository.save(agent);
        }

        Order savedOrder = orderRepository.save(order);

        // Fetch current coordinates of the assigned agent if available
        Double lat = null;
        Double lng = null;
        if (savedOrder.getAssignedAgent() != null) {
            Optional<AgentLocation> locOpt = agentLocationRepository.findByAgent(savedOrder.getAssignedAgent());
            if (locOpt.isPresent()) {
                lat = locOpt.get().getLatitude();
                lng = locOpt.get().getLongitude();
            }
        }

        // Save tracking history log
        TrackingHistory history = TrackingHistory.builder()
                .order(savedOrder)
                .status(OrderStatus.CANCELLED)
                .location("Cancellation Center")
                .remarks("Order cancelled by: " + user.getRole().name())
                .latitude(lat)
                .longitude(lng)
                .updatedBy(user)
                .build();
        trackingHistoryRepository.save(history);

        // Send cancellation notification
        notificationService.sendNotification(
                order.getSender(),
                "Cancelled",
                "Your package " + order.getTrackingNumber() + " has been successfully cancelled."
        );

        // WebSocket broadcast
        trackingSocketService.broadcastStatus(savedOrder.getTrackingNumber(), OrderStatus.CANCELLED.name(), savedOrder.getId());

        log.info("Order Cancelled successfully: trackingNumber={}", savedOrder.getTrackingNumber());
        return orderMapper.toResponse(savedOrder);
    }

    private String generateLMTrackingNumber() {
        String prefix = systemSettingService.getSetting("TRACKING_NUMBER_PREFIX", "LM");
        int lengthVal = systemSettingService.getSettingAsInteger("TRACKING_NUMBER_LENGTH", 14);
        
        String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyMMdd"));
        
        // Calculate remaining length for random number
        int randomLength = lengthVal - prefix.length() - dateStr.length();
        if (randomLength <= 0) {
            randomLength = 6; // fallback
        }
        
        long minRange = (long) Math.pow(10, randomLength - 1);
        long maxRange = (long) Math.pow(10, randomLength) - 1;
        long rand = minRange + (long) (random.nextDouble() * (maxRange - minRange));
        
        return prefix + dateStr + rand;
    }

    private void validateStateTransition(OrderStatus current, OrderStatus next) {
        if (current == next) {
            return;
        }

        // Terminal state checks
        if (current == OrderStatus.DELIVERED || current == OrderStatus.CANCELLED || current == OrderStatus.FAILED) {
            throw new BadRequestException("Cannot transition from final status: " + current);
        }

        // Cancellation allows transitions from initial stages
        if (next == OrderStatus.CANCELLED) {
            if (current == OrderStatus.ORDER_CREATED || current == OrderStatus.CONFIRMED || current == OrderStatus.ASSIGNED) {
                return;
            }
            throw new BadRequestException("Cannot cancel order once picked up or in transit");
        }

        // Normal Delivery Pipeline transitions
        boolean valid = switch (current) {
            case ORDER_CREATED -> next == OrderStatus.CONFIRMED || next == OrderStatus.ASSIGNED;
            case CONFIRMED -> next == OrderStatus.ASSIGNED;
            case ASSIGNED -> next == OrderStatus.PICKED_UP;
            case PICKED_UP -> next == OrderStatus.IN_TRANSIT;
            case IN_TRANSIT -> next == OrderStatus.REACHED_HUB;
            case REACHED_HUB -> next == OrderStatus.OUT_FOR_DELIVERY;
            case OUT_FOR_DELIVERY -> next == OrderStatus.DELIVERED || next == OrderStatus.FAILED;
            default -> false;
        };

        if (!valid) {
            throw new BadRequestException("Illegal order status transition from " + current + " to " + next);
        }
    }

    private DeliveryAgent findNearestAvailableAgent(String pickupPincode) {
        List<DeliveryAgent> availableAgents = agentRepository.findByAvailableTrue();
        if (availableAgents.isEmpty()) {
            throw new ResourceNotFoundException("No delivery agents are currently available online");
        }

        double pickupLat = 28.5355; 
        double pickupLng = 77.3910;

        Optional<Area> areaOpt = areaRepository.findByPincode(pickupPincode);
        if (areaOpt.isPresent()) {
            String areaName = areaOpt.get().getName().toLowerCase();
            if (areaName.contains("delhi south") || areaName.contains("south delhi")) {
                pickupLat = 28.5672;
                pickupLng = 77.2190;
            } else if (areaName.contains("delhi north") || areaName.contains("north delhi")) {
                pickupLat = 28.6800;
                pickupLng = 77.1200;
            } else if (areaName.contains("gurgaon") || areaName.contains("gurugram")) {
                pickupLat = 28.4595;
                pickupLng = 77.0266;
            }
        }

        DeliveryAgent nearestAgent = null;
        double minDistance = Double.MAX_VALUE;

        for (DeliveryAgent agent : availableAgents) {
            if (agent.getLatitude() == null || agent.getLongitude() == null || (agent.getLatitude() == 0.0 && agent.getLongitude() == 0.0)) {
                continue;
            }
            double dist = LocationUtils.calculateDistance(pickupLat, pickupLng, agent.getLatitude(), agent.getLongitude());
            if (dist < minDistance) {
                minDistance = dist;
                nearestAgent = agent;
            }
        }

        if (nearestAgent == null) {
            return availableAgents.get(0);
        }

        return nearestAgent;
    }
}
