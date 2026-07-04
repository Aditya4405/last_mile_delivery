package com.lastmiletracker.dashboard.service;

import com.lastmiletracker.agent.entity.AgentLocation;
import com.lastmiletracker.agent.entity.DeliveryAgent;
import com.lastmiletracker.agent.repository.AgentLocationRepository;
import com.lastmiletracker.agent.repository.DeliveryAgentRepository;
import com.lastmiletracker.agent.service.AgentService;
import com.lastmiletracker.dashboard.dto.*;
import com.lastmiletracker.exception.ForbiddenException;
import com.lastmiletracker.exception.ResourceNotFoundException;
import com.lastmiletracker.tracking.dto.LiveLocationResponse;
import com.lastmiletracker.order.dto.OrderResponse;
import com.lastmiletracker.order.entity.Order;
import com.lastmiletracker.order.entity.OrderStatus;
import com.lastmiletracker.order.mapper.OrderMapper;
import com.lastmiletracker.order.repository.OrderRepository;
import com.lastmiletracker.notification.dto.NotificationResponse;
import com.lastmiletracker.notification.entity.Notification;
import com.lastmiletracker.notification.repository.NotificationRepository;
import com.lastmiletracker.notification.service.NotificationService;
import com.lastmiletracker.tracking.service.ETACalculationService;
import com.lastmiletracker.user.entity.Role;
import com.lastmiletracker.user.entity.User;
import com.lastmiletracker.user.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
@Slf4j
public class DashboardService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final DeliveryAgentRepository agentRepository;
    private final AgentLocationRepository agentLocationRepository;
    private final NotificationRepository notificationRepository;
    private final NotificationService notificationService;
    private final ETACalculationService etaCalculationService;
    private final OrderMapper orderMapper;
    private final AgentService agentService;

    public DashboardService(
            OrderRepository orderRepository,
            UserRepository userRepository,
            DeliveryAgentRepository agentRepository,
            AgentLocationRepository agentLocationRepository,
            NotificationRepository notificationRepository,
            NotificationService notificationService,
            @Lazy ETACalculationService etaCalculationService,
            OrderMapper orderMapper,
            @Lazy AgentService agentService) {
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.agentRepository = agentRepository;
        this.agentLocationRepository = agentLocationRepository;
        this.notificationRepository = notificationRepository;
        this.notificationService = notificationService;
        this.etaCalculationService = etaCalculationService;
        this.orderMapper = orderMapper;
        this.agentService = agentService;
    }

    /* ===========================================================
       Customer Dashboard Methods
       =========================================================== */

    public CustomerDashboardResponse getCustomerDashboard(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer user profile not found"));

        long totalShipments = orderRepository.countBySenderId(user.getId());
        long delivered = orderRepository.countBySenderIdAndStatus(user.getId(), OrderStatus.DELIVERED);
        long cancelled = orderRepository.countBySenderIdAndStatus(user.getId(), OrderStatus.CANCELLED);
        long failed = orderRepository.countBySenderIdAndStatus(user.getId(), OrderStatus.FAILED);
        long pending = totalShipments - delivered - cancelled - failed;

        Double totalMoneySpentVal = orderRepository.sumShippingChargeBySenderId(user.getId());
        double totalMoneySpent = totalMoneySpentVal != null ? totalMoneySpentVal : 0.0;

        List<Order> recent = orderRepository.findRecentOrdersBySenderId(user.getId(), PageRequest.of(0, 1));
        OrderResponse latestTracking = recent.isEmpty() ? null : orderMapper.toResponse(recent.get(0));

        Map<String, Object> profileSummary = Map.of(
                "fullName", user.getFullName(),
                "email", user.getEmail(),
                "phone", user.getPhone(),
                "role", user.getRole().name()
        );

        return CustomerDashboardResponse.builder()
                .welcomeMessage("Welcome back, " + user.getFullName() + "!")
                .totalShipments(totalShipments)
                .pendingShipments(pending)
                .deliveredShipments(delivered)
                .totalMoneySpent(totalMoneySpent)
                .profileSummary(profileSummary)
                .latestTracking(latestTracking)
                .build();
    }

    public List<OrderResponse> getCustomerRecentShipments(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer user profile not found"));

        return orderRepository.findRecentOrdersBySenderId(user.getId(), PageRequest.of(0, 10))
                .stream()
                .map(orderMapper::toResponse)
                .collect(Collectors.toList());
    }

    public CustomerChartResponse getCustomerChart(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer user profile not found"));

        List<Order> orders = orderRepository.findRecentOrdersBySenderId(user.getId(), PageRequest.of(0, 100));
        LocalDate today = LocalDate.now();

        // 1. Last 7 Days Weekly spending
        List<Map<String, Object>> weekly = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            double daySum = orders.stream()
                    .filter(o -> o.getCreatedAt().toLocalDate().isEqual(date))
                    .mapToDouble(Order::getShippingCharge)
                    .sum();
            weekly.add(Map.of(
                    "day", date.getDayOfWeek().name(),
                    "amount", daySum,
                    "date", date.toString()
            ));
        }

        // 2. Last 6 Months Monthly spending
        List<Map<String, Object>> monthly = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            LocalDate date = today.minusMonths(i);
            double monthSum = orders.stream()
                    .filter(o -> o.getCreatedAt().getYear() == date.getYear() 
                            && o.getCreatedAt().getMonth() == date.getMonth())
                    .mapToDouble(Order::getShippingCharge)
                    .sum();
            monthly.add(Map.of(
                    "month", date.getMonth().name(),
                    "amount", monthSum
            ));
        }

        // 3. Status distribution
        List<Map<String, Object>> dist = new ArrayList<>();
        for (OrderStatus status : OrderStatus.values()) {
            long count = orders.stream().filter(o -> o.getStatus() == status).count();
            if (count > 0) {
                dist.add(Map.of("status", status.name(), "count", count));
            }
        }

        return CustomerChartResponse.builder()
                .weeklySpending(weekly)
                .monthlySpending(monthly)
                .statusDistribution(dist)
                .build();
    }

    public List<FAQResponse> getFAQs() {
        return List.of(
                FAQResponse.builder()
                        .id(1L)
                        .question("How do I book a shipment?")
                        .answer("Click on 'Book New Shipment' from your dashboard and provide recipient contact, pickup address, package dimensions, and weight.")
                        .category("Booking")
                        .build(),
                FAQResponse.builder()
                        .id(2L)
                        .question("How is the shipping charge calculated?")
                        .answer("Shipping charges are computed based on parcel volumetric weight and distance between pickup and delivery zones.")
                        .category("Billing")
                        .build(),
                FAQResponse.builder()
                        .id(3L)
                        .question("How can I track my shipment?")
                        .answer("Open your dashboard, find the order in the 'Recent Shipments' section, or use your LM tracking number on the tracking page to view the live agent map.")
                        .category("Tracking")
                        .build(),
                FAQResponse.builder()
                        .id(4L)
                        .question("What is COD pending?")
                        .answer("It represents the sum of cash collection amounts for orders currently out for delivery that have not yet reached a delivered state.")
                        .category("Billing")
                        .build()
        );
    }

    public List<NotificationResponse> getCustomerNotifications(String email) {
        return notificationService.getUserNotifications(email, false);
    }

    public CustomerStatisticsResponse getCustomerStatistics(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer user profile not found"));

        long totalShipments = orderRepository.countBySenderId(user.getId());
        long pending = totalShipments 
                - orderRepository.countBySenderIdAndStatus(user.getId(), OrderStatus.DELIVERED)
                - orderRepository.countBySenderIdAndStatus(user.getId(), OrderStatus.CANCELLED)
                - orderRepository.countBySenderIdAndStatus(user.getId(), OrderStatus.FAILED);
        long delivered = orderRepository.countBySenderIdAndStatus(user.getId(), OrderStatus.DELIVERED);
        long cancelled = orderRepository.countBySenderIdAndStatus(user.getId(), OrderStatus.CANCELLED);
        long failed = orderRepository.countBySenderIdAndStatus(user.getId(), OrderStatus.FAILED);

        Double totalMoneySpentVal = orderRepository.sumShippingChargeBySenderId(user.getId());
        double totalMoneySpent = totalMoneySpentVal != null ? totalMoneySpentVal : 0.0;

        Double codPendingVal = orderRepository.sumCodPendingBySenderId(user.getId());
        double codPending = codPendingVal != null ? codPendingVal : 0.0;

        return CustomerStatisticsResponse.builder()
                .totalShipments(totalShipments)
                .pending(pending)
                .delivered(delivered)
                .cancelled(cancelled)
                .failed(failed)
                .totalMoneySpent(totalMoneySpent)
                .codPending(codPending)
                .build();
    }

    /* ===========================================================
       Delivery Agent Dashboard Methods
       =========================================================== */

    public AgentDashboardResponse getAgentDashboard(String email) {
        DeliveryAgent agent = agentRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery agent profile not found"));

        long todayOrders = orderRepository.countTodayOrdersByAgentId(agent.getId());
        long pendingPickups = orderRepository.countTodayOrdersByAgentIdAndStatus(agent.getId(), OrderStatus.ASSIGNED);
        long deliveredToday = orderRepository.countTodayOrdersByAgentIdAndStatus(agent.getId(), OrderStatus.DELIVERED);
        long failedAttempts = orderRepository.countTodayOrdersByAgentIdAndStatus(agent.getId(), OrderStatus.FAILED);

        // Calculate performance score
        long totalDelivered = orderRepository.countByAssignedAgentIdAndStatus(agent.getId(), OrderStatus.DELIVERED);
        long totalFailed = orderRepository.countByAssignedAgentIdAndStatus(agent.getId(), OrderStatus.FAILED);
        long totalAssigned = totalDelivered + totalFailed + orderRepository.countByAssignedAgentIdAndStatus(agent.getId(), OrderStatus.ASSIGNED);
        double performanceScore = totalAssigned > 0 ? ((double) totalDelivered / totalAssigned) * 100.0 : 100.0;

        // Fetch current active delivery
        List<Order> activeOrders = orderRepository.findAll().stream()
                .filter(o -> o.getAssignedAgent() != null && o.getAssignedAgent().getId().equals(agent.getId()))
                .filter(o -> o.getStatus() != OrderStatus.DELIVERED 
                        && o.getStatus() != OrderStatus.FAILED 
                        && o.getStatus() != OrderStatus.CANCELLED)
                .toList();
        OrderResponse currentActive = activeOrders.isEmpty() ? null : orderMapper.toResponse(activeOrders.get(0));

        Map<String, Object> profileSummary = Map.of(
                "fullName", agent.getUser().getFullName(),
                "email", agent.getUser().getEmail(),
                "phone", agent.getUser().getPhone(),
                "vehicleType", agent.getVehicleType(),
                "licenseNumber", agent.getLicenseNumber() != null ? agent.getLicenseNumber() : "N/A"
        );

        return AgentDashboardResponse.builder()
                .available(agent.isAvailable())
                .shiftStatus(agent.isAvailable() ? "ON_DUTY" : "OFF_DUTY")
                .todayOrdersCount(todayOrders)
                .pendingPickupsCount(pendingPickups)
                .deliveredTodayCount(deliveredToday)
                .failedAttemptsCount(failedAttempts)
                .performanceScore(performanceScore)
                .currentActiveDelivery(currentActive)
                .profileSummary(profileSummary)
                .build();
    }

    public AgentPerformanceResponse getAgentPerformance(String email) {
        DeliveryAgent agent = agentRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery agent profile not found"));

        long todayDelivered = orderRepository.countTodayOrdersByAgentIdAndStatus(agent.getId(), OrderStatus.DELIVERED);
        long totalDelivered = orderRepository.countByAssignedAgentIdAndStatus(agent.getId(), OrderStatus.DELIVERED);
        long totalFailed = orderRepository.countByAssignedAgentIdAndStatus(agent.getId(), OrderStatus.FAILED);
        long totalAssigned = totalDelivered + totalFailed + orderRepository.countByAssignedAgentIdAndStatus(agent.getId(), OrderStatus.ASSIGNED);
        double successRate = totalAssigned > 0 ? ((double) totalDelivered / totalAssigned) * 100.0 : 100.0;

        return AgentPerformanceResponse.builder()
                .performanceScore(successRate)
                .averageDeliveryTimeMinutes(35.0) // Operational benchmark standard
                .successRate(successRate)
                .deliveredToday(todayDelivered)
                .totalDelivered(totalDelivered)
                .totalAssigned(totalAssigned)
                .build();
    }

    public AgentRouteResponse getAgentCurrentRoute(String email) {
        DeliveryAgent agent = agentRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery agent profile not found"));

        // Fetch current active delivery
        List<Order> activeOrders = orderRepository.findAll().stream()
                .filter(o -> o.getAssignedAgent() != null && o.getAssignedAgent().getId().equals(agent.getId()))
                .filter(o -> o.getStatus() != OrderStatus.DELIVERED 
                        && o.getStatus() != OrderStatus.FAILED 
                        && o.getStatus() != OrderStatus.CANCELLED)
                .toList();

        if (activeOrders.isEmpty()) {
            throw new ResourceNotFoundException("No active delivery route assigned to agent");
        }

        Order order = activeOrders.get(0);
        double[] pickupCoords = etaCalculationService.getDeliveryCoordinates(order.getPickupPincode());
        double[] deliveryCoords = etaCalculationService.getDeliveryCoordinates(order.getDeliveryPincode());
        
        Optional<AgentLocation> agentLocOpt = agentLocationRepository.findByAgent(agent);
        double agentLat = agentLocOpt.isPresent() ? agentLocOpt.get().getLatitude() : agent.getLatitude() != null ? agent.getLatitude() : pickupCoords[0];
        double agentLng = agentLocOpt.isPresent() ? agentLocOpt.get().getLongitude() : agent.getLongitude() != null ? agent.getLongitude() : pickupCoords[1];

        int eta = etaCalculationService.calculateETA(
                agentLat,
                agentLng,
                agentLocOpt.map(AgentLocation::getSpeed).orElse(0.0),
                order.getDeliveryPincode()
        );

        return AgentRouteResponse.builder()
                .orderId(order.getId())
                .trackingNumber(order.getTrackingNumber())
                .agentLatitude(agentLat)
                .agentLongitude(agentLng)
                .pickupAddress(order.getPickupAddress())
                .pickupLatitude(pickupCoords[0])
                .pickupLongitude(pickupCoords[1])
                .deliveryAddress(order.getDeliveryAddress())
                .deliveryLatitude(deliveryCoords[0])
                .deliveryLongitude(deliveryCoords[1])
                .status(order.getStatus().name())
                .etaMinutes(eta)
                .build();
    }

    public LiveLocationResponse getAgentCurrentLocation(String email) {
        DeliveryAgent agent = agentRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery agent profile not found"));

        AgentLocation location = agentLocationRepository.findByAgent(agent)
                .orElseThrow(() -> new ResourceNotFoundException("Agent current coordinates not available"));

        return LiveLocationResponse.builder()
                .agentId(agent.getId())
                .latitude(location.getLatitude())
                .longitude(location.getLongitude())
                .speed(location.getSpeed())
                .heading(location.getHeading())
                .accuracy(location.getAccuracy())
                .batteryLevel(location.getBatteryLevel())
                .timestamp(location.getLastUpdated())
                .build();
    }

    public List<OrderResponse> getAgentAssignedOrders(String email) {
        DeliveryAgent agent = agentRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery agent profile not found"));

        return orderRepository.findRecentOrdersByAgentId(agent.getId(), PageRequest.of(0, 100))
                .stream()
                .map(orderMapper::toResponse)
                .collect(Collectors.toList());
    }

    public AgentStatisticsResponse getAgentStatistics(String email) {
        DeliveryAgent agent = agentRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery agent profile not found"));

        long todayOrders = orderRepository.countTodayOrdersByAgentId(agent.getId());
        long pendingPickups = orderRepository.countTodayOrdersByAgentIdAndStatus(agent.getId(), OrderStatus.ASSIGNED);
        long deliveredToday = orderRepository.countTodayOrdersByAgentIdAndStatus(agent.getId(), OrderStatus.DELIVERED);
        long failedDeliveries = orderRepository.countTodayOrdersByAgentIdAndStatus(agent.getId(), OrderStatus.FAILED);

        // Fetch active assignment
        List<Order> activeOrders = orderRepository.findAll().stream()
                .filter(o -> o.getAssignedAgent() != null && o.getAssignedAgent().getId().equals(agent.getId()))
                .filter(o -> o.getStatus() != OrderStatus.DELIVERED 
                        && o.getStatus() != OrderStatus.FAILED 
                        && o.getStatus() != OrderStatus.CANCELLED)
                .toList();

        Long currentAssignmentId = activeOrders.isEmpty() ? null : activeOrders.get(0).getId();
        String currentAssignmentTracking = activeOrders.isEmpty() ? null : activeOrders.get(0).getTrackingNumber();

        // Coordinates
        Optional<AgentLocation> locOpt = agentLocationRepository.findByAgent(agent);
        Map<String, Double> coords = locOpt.map(location -> Map.of(
                "latitude", location.getLatitude(),
                "longitude", location.getLongitude()
        )).orElse(agent.getLatitude() != null ? Map.of("latitude", agent.getLatitude(), "longitude", agent.getLongitude()) : Map.of("latitude", 0.0, "longitude", 0.0));

        // Calculations
        long totalDelivered = orderRepository.countByAssignedAgentIdAndStatus(agent.getId(), OrderStatus.DELIVERED);
        long totalFailed = orderRepository.countByAssignedAgentIdAndStatus(agent.getId(), OrderStatus.FAILED);
        long totalAssigned = totalDelivered + totalFailed + orderRepository.countByAssignedAgentIdAndStatus(agent.getId(), OrderStatus.ASSIGNED);
        double successRate = totalAssigned > 0 ? ((double) totalDelivered / totalAssigned) * 100.0 : 100.0;

        return AgentStatisticsResponse.builder()
                .todayOrders(todayOrders)
                .pendingPickups(pendingPickups)
                .deliveredToday(deliveredToday)
                .failedDeliveries(failedDeliveries)
                .currentAssignmentId(currentAssignmentId)
                .currentAssignmentTrackingNumber(currentAssignmentTracking)
                .liveCoordinates(coords)
                .performanceScore(successRate)
                .averageDeliveryTime(34.5)
                .successRate(successRate)
                .currentShiftStatus(agent.isAvailable() ? "ACTIVE" : "OFFLINE")
                .build();
    }

    @Transactional
    public void updateAgentAvailability(String email, boolean available) {
        agentService.updateAvailability(email, available);
    }

    /* ===========================================================
       Admin Dashboard Methods
       =========================================================== */

    public AdminDashboardResponse getAdminDashboard() {
        Double totalRev = orderRepository.sumTotalRevenue();
        double totalDeliveryCharges = totalRev != null ? totalRev : 0.0;
        long totalShipments = orderRepository.count();
        long activeClients = userRepository.countByRole(Role.CUSTOMER);
        long activeDeliveryExecutives = agentRepository.count();
        long pendingPickups = orderRepository.countByStatus(OrderStatus.ORDER_CREATED) + orderRepository.countByStatus(OrderStatus.CONFIRMED);

        // System success rate
        long totalDelivered = orderRepository.countByStatus(OrderStatus.DELIVERED);
        long totalFailed = orderRepository.countByStatus(OrderStatus.FAILED);
        long totalTerminal = totalDelivered + totalFailed;
        double successRate = totalTerminal > 0 ? ((double) totalDelivered / totalTerminal) * 100.0 : 100.0;

        List<OrderResponse> recent = orderRepository.findAll(PageRequest.of(0, 10)).stream()
                .map(orderMapper::toResponse)
                .collect(Collectors.toList());

        return AdminDashboardResponse.builder()
                .totalDeliveryCharges(totalDeliveryCharges)
                .totalShipments(totalShipments)
                .activeClients(activeClients)
                .activeDeliveryExecutives(activeDeliveryExecutives)
                .pendingPickups(pendingPickups)
                .successRate(successRate)
                .recentOrders(recent)
                .build();
    }

    public AdminFleetResponse getAdminFleet() {
        List<Map<String, Object>> activeAgents = new ArrayList<>();
        List<DeliveryAgent> agents = agentRepository.findAll();

        for (DeliveryAgent agent : agents) {
            Optional<AgentLocation> locOpt = agentLocationRepository.findByAgent(agent);
            double lat = locOpt.isPresent() ? locOpt.get().getLatitude() : agent.getLatitude() != null ? agent.getLatitude() : 0.0;
            double lng = locOpt.isPresent() ? locOpt.get().getLongitude() : agent.getLongitude() != null ? agent.getLongitude() : 0.0;

            // Fetch active orders assigned
            List<Order> activeOrders = orderRepository.findAll().stream()
                    .filter(o -> o.getAssignedAgent() != null && o.getAssignedAgent().getId().equals(agent.getId()))
                    .filter(o -> o.getStatus() != OrderStatus.DELIVERED 
                            && o.getStatus() != OrderStatus.FAILED 
                            && o.getStatus() != OrderStatus.CANCELLED)
                    .toList();

            activeAgents.add(Map.of(
                    "agentId", agent.getId(),
                    "fullName", agent.getUser().getFullName(),
                    "phone", agent.getUser().getPhone(),
                    "latitude", lat,
                    "longitude", lng,
                    "status", agent.isAvailable() ? "AVAILABLE" : "BUSY",
                    "activeOrderId", activeOrders.isEmpty() ? null : activeOrders.get(0).getId(),
                    "activeTrackingNumber", activeOrders.isEmpty() ? null : activeOrders.get(0).getTrackingNumber()
            ));
        }

        return AdminFleetResponse.builder().activeAgents(activeAgents).build();
    }

    public AdminRevenueResponse getAdminRevenue() {
        Double totalRev = orderRepository.sumTotalRevenue();
        double totalRevenue = totalRev != null ? totalRev : 0.0;

        Double todayRev = orderRepository.sumTodayRevenue();
        double todayRevenue = todayRev != null ? todayRev : 0.0;

        Double monthlyRev = orderRepository.sumCurrentMonthRevenue();
        double monthlyRevenue = monthlyRev != null ? monthlyRev : 0.0;

        Double yearlyRev = orderRepository.sumCurrentYearRevenue();
        double yearlyRevenue = yearlyRev != null ? yearlyRev : 0.0;

        long totalOrders = orderRepository.count();
        double averageShippingCost = totalOrders > 0 ? (totalRevenue / totalOrders) : 0.0;

        // Revenue trends: group last 6 months
        LocalDate today = LocalDate.now();
        List<Map<String, Object>> trends = new ArrayList<>();
        List<Order> orders = orderRepository.findAll();

        for (int i = 5; i >= 0; i--) {
            LocalDate date = today.minusMonths(i);
            double monthSum = orders.stream()
                    .filter(o -> o.getCreatedAt().getYear() == date.getYear() 
                            && o.getCreatedAt().getMonth() == date.getMonth())
                    .mapToDouble(Order::getShippingCharge)
                    .sum();
            trends.add(Map.of(
                    "month", date.getMonth().name(),
                    "amount", monthSum
            ));
        }

        return AdminRevenueResponse.builder()
                .totalRevenue(totalRevenue)
                .todayRevenue(todayRevenue)
                .monthlyRevenue(monthlyRevenue)
                .yearlyRevenue(yearlyRevenue)
                .averageShippingCost(averageShippingCost)
                .revenueTrends(trends)
                .build();
    }

    public AdminAnalyticsResponse getAdminAnalytics() {
        long totalOrders = orderRepository.count();
        long pending = orderRepository.countByStatus(OrderStatus.ORDER_CREATED) + orderRepository.countByStatus(OrderStatus.CONFIRMED);
        long delivered = orderRepository.countByStatus(OrderStatus.DELIVERED);
        long cancelled = orderRepository.countByStatus(OrderStatus.CANCELLED);
        long failed = orderRepository.countByStatus(OrderStatus.FAILED);
        long inTransit = orderRepository.countByStatus(OrderStatus.IN_TRANSIT);
        long outForDelivery = orderRepository.countByStatus(OrderStatus.OUT_FOR_DELIVERY);

        long totalCustomers = userRepository.countByRole(Role.CUSTOMER);
        
        // Active customers (have placed at least one order)
        long activeCustomers = orderRepository.findTopCustomers(PageRequest.of(0, 100)).size();

        long totalAgents = agentRepository.count();
        long availableAgents = agentRepository.countByAvailableTrue();
        long busyAgents = agentRepository.countByAvailableFalse();

        // Top Delivery Agent
        List<Object[]> topAgentData = orderRepository.findTopAgents(PageRequest.of(0, 1));
        Map<String, Object> topAgent = topAgentData.isEmpty() ? Map.of("agentId", "N/A", "name", "None") : Map.of(
                "agentId", topAgentData.get(0)[0],
                "name", topAgentData.get(0)[1],
                "orderCount", topAgentData.get(0)[2]
        );

        // Top Customer
        List<Object[]> topCustomerData = orderRepository.findTopCustomers(PageRequest.of(0, 1));
        Map<String, Object> topCust = topCustomerData.isEmpty() ? Map.of("customerId", "N/A", "name", "None") : Map.of(
                "customerId", topCustomerData.get(0)[0],
                "name", topCustomerData.get(0)[1],
                "orderCount", topCustomerData.get(0)[2],
                "totalSpent", topCustomerData.get(0)[3]
        );

        // Top Zone
        List<Object[]> topZoneData = orderRepository.findTopZones(PageRequest.of(0, 1));
        Map<String, Object> topZ = topZoneData.isEmpty() ? Map.of("zoneId", "N/A", "name", "None") : Map.of(
                "zoneId", topZoneData.get(0)[0],
                "name", topZoneData.get(0)[1],
                "orderCount", topZoneData.get(0)[2]
        );

        // Top Area (City)
        List<Object[]> topCityData = orderRepository.findTopCities(PageRequest.of(0, 1));
        Map<String, Object> topA = topCityData.isEmpty() ? Map.of("area", "N/A") : Map.of(
                "area", topCityData.get(0)[0],
                "orderCount", topCityData.get(0)[1]
        );

        // Zone Distribution
        List<Object[]> zoneDistributionData = orderRepository.findTopZones(PageRequest.of(0, 10));
        List<Map<String, Object>> zoneDist = zoneDistributionData.stream()
                .map(row -> Map.of("zoneId", row[0], "name", row[1], "count", row[2]))
                .collect(Collectors.toList());

        // Weekly deliveries chart data
        LocalDate today = LocalDate.now();
        List<Map<String, Object>> weekly = new ArrayList<>();
        List<Order> allOrders = orderRepository.findAll();

        for (int i = 6; i >= 0; i--) {
            LocalDate date = today.minusDays(i);
            long dayCount = allOrders.stream()
                    .filter(o -> o.getCreatedAt().toLocalDate().isEqual(date) 
                            && o.getStatus() == OrderStatus.DELIVERED)
                    .count();
            weekly.add(Map.of(
                    "day", date.getDayOfWeek().name(),
                    "count", dayCount
            ));
        }

        // Monthly deliveries chart data
        List<Map<String, Object>> monthly = new ArrayList<>();
        for (int i = 5; i >= 0; i--) {
            LocalDate date = today.minusMonths(i);
            long monthCount = allOrders.stream()
                    .filter(o -> o.getCreatedAt().getYear() == date.getYear() 
                            && o.getCreatedAt().getMonth() == date.getMonth() 
                            && o.getStatus() == OrderStatus.DELIVERED)
                    .count();
            monthly.add(Map.of(
                    "month", date.getMonth().name(),
                    "count", monthCount
            ));
        }

        double successRate = (delivered + failed) > 0 ? ((double) delivered / (delivered + failed)) * 100.0 : 100.0;

        return AdminAnalyticsResponse.builder()
                .totalOrders(totalOrders)
                .pendingOrders(pending)
                .deliveredOrders(delivered)
                .cancelledOrders(cancelled)
                .failedOrders(failed)
                .ordersInTransit(inTransit)
                .ordersOutForDelivery(outForDelivery)
                .totalCustomers(totalCustomers)
                .activeCustomers(activeCustomers)
                .totalAgents(totalAgents)
                .availableAgents(availableAgents)
                .busyAgents(busyAgents)
                .offlineAgents(totalAgents - availableAgents - busyAgents)
                .averageDeliveryTime(38.5)
                .successRate(successRate)
                .topDeliveryAgent(topAgent)
                .topCustomer(topCust)
                .topZone(topZ)
                .topArea(topA)
                .zoneDistribution(zoneDist)
                .weeklyDeliveries(weekly)
                .monthlyDeliveries(monthly)
                .build();
    }

    public List<OrderResponse> getAdminRecentOrders() {
        return orderRepository.findAll(PageRequest.of(0, 10)).stream()
                .map(orderMapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<NotificationResponse> getAdminRecentNotifications() {
        return notificationRepository.findAll(PageRequest.of(0, 10)).stream()
                .map(n -> NotificationResponse.builder()
                        .id(n.getId())
                        .title(n.getTitle())
                        .message(n.getMessage())
                        .readStatus(n.isReadStatus())
                        .createdAt(n.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }
}
