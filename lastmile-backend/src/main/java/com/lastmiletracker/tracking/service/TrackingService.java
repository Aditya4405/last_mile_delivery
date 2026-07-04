package com.lastmiletracker.tracking.service;

import com.lastmiletracker.agent.entity.AgentLocation;
import com.lastmiletracker.agent.entity.DeliveryAgent;
import com.lastmiletracker.agent.repository.AgentLocationRepository;
import com.lastmiletracker.agent.repository.DeliveryAgentRepository;
import com.lastmiletracker.exception.BadRequestException;
import com.lastmiletracker.exception.ForbiddenException;
import com.lastmiletracker.exception.ResourceNotFoundException;
import com.lastmiletracker.order.entity.Order;
import com.lastmiletracker.order.entity.OrderStatus;
import com.lastmiletracker.order.repository.OrderRepository;
import com.lastmiletracker.tracking.dto.LiveLocationResponse;
import com.lastmiletracker.tracking.dto.TrackingResponse;
import com.lastmiletracker.tracking.entity.TrackingHistory;
import com.lastmiletracker.tracking.mapper.TrackingMapper;
import com.lastmiletracker.tracking.repository.TrackingHistoryRepository;
import com.lastmiletracker.user.entity.Role;
import com.lastmiletracker.user.entity.User;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class TrackingService {

    private final OrderRepository orderRepository;
    private final TrackingHistoryRepository historyRepository;
    private final TrackingMapper trackingMapper;
    private final AgentLocationRepository agentLocationRepository;
    private final DeliveryAgentRepository agentRepository;
    private final ETACalculationService etaCalculationService;

    public TrackingService(
            OrderRepository orderRepository,
            TrackingHistoryRepository historyRepository,
            TrackingMapper trackingMapper,
            AgentLocationRepository agentLocationRepository,
            DeliveryAgentRepository agentRepository,
            @Lazy ETACalculationService etaCalculationService) {
        this.orderRepository = orderRepository;
        this.historyRepository = historyRepository;
        this.trackingMapper = trackingMapper;
        this.agentLocationRepository = agentLocationRepository;
        this.agentRepository = agentRepository;
        this.etaCalculationService = etaCalculationService;
    }

    public TrackingResponse getTrackingTimeline(String trackingNumber) {
        Order order = orderRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new ResourceNotFoundException("No shipment found matching tracking number: " + trackingNumber));
        
        List<TrackingHistory> historyList = historyRepository.findByOrderTrackingNumberOrderByUpdatedAtAsc(trackingNumber);
        return trackingMapper.toResponse(order, historyList);
    }

    public TrackingResponse getTrackingTimelineByOrderId(Long orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("No shipment found with id: " + orderId));
        
        List<TrackingHistory> historyList = historyRepository.findByOrderIdOrderByUpdatedAtAsc(orderId);
        return trackingMapper.toResponse(order, historyList);
    }

    /**
     * Retrieve the latest coordinates for a shipment using its tracking number
     */
    public LiveLocationResponse getLiveLocation(String trackingNumber, User user) {
        Order order = orderRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found for tracking number: " + trackingNumber));

        // Enforce security boundaries
        if (user.getRole() == Role.CUSTOMER && !order.getSender().getEmail().equals(user.getEmail())) {
            throw new ForbiddenException("Access Denied: You do not have permission to view this order's live coordinates.");
        }
        if (user.getRole() == Role.DELIVERY_AGENT && (order.getAssignedAgent() == null 
                || !order.getAssignedAgent().getUser().getEmail().equals(user.getEmail()))) {
            throw new ForbiddenException("Access Denied: You do not have permission to view this order's live coordinates.");
        }

        if (order.getAssignedAgent() == null) {
            throw new BadRequestException("No delivery agent is currently assigned to this order");
        }

        DeliveryAgent agent = order.getAssignedAgent();
        AgentLocation location = agentLocationRepository.findByAgent(agent)
                .orElseThrow(() -> new ResourceNotFoundException("Live location coordinates not available for assigned agent yet"));

        int eta = etaCalculationService.calculateETA(
                location.getLatitude(),
                location.getLongitude(),
                location.getSpeed(),
                order.getDeliveryPincode()
        );

        return LiveLocationResponse.builder()
                .agentId(agent.getId())
                .trackingNumber(order.getTrackingNumber())
                .orderId(order.getId())
                .latitude(location.getLatitude())
                .longitude(location.getLongitude())
                .speed(location.getSpeed())
                .heading(location.getHeading())
                .accuracy(location.getAccuracy())
                .batteryLevel(location.getBatteryLevel())
                .status(order.getStatus().name())
                .timestamp(location.getLastUpdated())
                .eta(eta)
                .build();
    }

    /**
     * Retrieve the estimated minutes of arrival for a shipment
     */
    public int getETA(String trackingNumber, User user) {
        Order order = orderRepository.findByTrackingNumber(trackingNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found for tracking number: " + trackingNumber));

        // Enforce security boundaries
        if (user.getRole() == Role.CUSTOMER && !order.getSender().getEmail().equals(user.getEmail())) {
            throw new ForbiddenException("Access Denied: You do not have permission to view this order's ETA.");
        }
        if (user.getRole() == Role.DELIVERY_AGENT && (order.getAssignedAgent() == null 
                || !order.getAssignedAgent().getUser().getEmail().equals(user.getEmail()))) {
            throw new ForbiddenException("Access Denied: You do not have permission to view this order's ETA.");
        }

        if (order.getAssignedAgent() == null) {
            throw new BadRequestException("No delivery agent is currently assigned to this order");
        }

        DeliveryAgent agent = order.getAssignedAgent();
        AgentLocation location = agentLocationRepository.findByAgent(agent)
                .orElseThrow(() -> new ResourceNotFoundException("Live coordinates not available for assigned agent yet"));

        return etaCalculationService.calculateETA(
                location.getLatitude(),
                location.getLongitude(),
                location.getSpeed(),
                order.getDeliveryPincode()
        );
    }

    /**
     * Retrieve coordinates for a specific agent
     */
    public LiveLocationResponse getAgentLiveLocation(Long agentId, User user) {
        DeliveryAgent agent = agentRepository.findById(agentId)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery agent not found for ID: " + agentId));

        // Enforce security boundaries
        if (user.getRole() == Role.CUSTOMER) {
            throw new ForbiddenException("Access Denied: Customers cannot view general agent coordinates.");
        }
        if (user.getRole() == Role.DELIVERY_AGENT && !agent.getUser().getEmail().equals(user.getEmail())) {
            throw new ForbiddenException("Access Denied: You can only view your own coordinates.");
        }

        AgentLocation location = agentLocationRepository.findByAgent(agent)
                .orElseThrow(() -> new ResourceNotFoundException("No live coordinates found for agent ID: " + agentId));

        // Find if agent has an active order to map tracking coordinates contextually
        Optional<Order> activeOrderOpt = orderRepository.findAll().stream()
                .filter(o -> o.getAssignedAgent() != null && o.getAssignedAgent().getId().equals(agentId))
                .filter(o -> o.getStatus() != OrderStatus.DELIVERED 
                        && o.getStatus() != OrderStatus.FAILED 
                        && o.getStatus() != OrderStatus.CANCELLED)
                .findFirst();

        String trackingNumber = activeOrderOpt.map(Order::getTrackingNumber).orElse(null);
        Long orderId = activeOrderOpt.map(Order::getId).orElse(null);
        String status = activeOrderOpt.map(o -> o.getStatus().name()).orElse("OFFLINE");
        Integer eta = null;

        if (activeOrderOpt.isPresent()) {
            eta = etaCalculationService.calculateETA(
                    location.getLatitude(),
                    location.getLongitude(),
                    location.getSpeed(),
                    activeOrderOpt.get().getDeliveryPincode()
            );
        }

        return LiveLocationResponse.builder()
                .agentId(agent.getId())
                .trackingNumber(trackingNumber)
                .orderId(orderId)
                .latitude(location.getLatitude())
                .longitude(location.getLongitude())
                .speed(location.getSpeed())
                .heading(location.getHeading())
                .accuracy(location.getAccuracy())
                .batteryLevel(location.getBatteryLevel())
                .status(status)
                .timestamp(location.getLastUpdated())
                .eta(eta)
                .build();
    }
}
