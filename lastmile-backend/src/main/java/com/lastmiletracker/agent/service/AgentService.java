package com.lastmiletracker.agent.service;

import com.lastmiletracker.agent.dto.AgentProfileResponse;
import com.lastmiletracker.agent.dto.AgentProfileUpdateRequest;
import com.lastmiletracker.agent.dto.LiveLocationRequest;
import com.lastmiletracker.agent.entity.AgentLocation;
import com.lastmiletracker.agent.entity.DeliveryAgent;
import com.lastmiletracker.agent.mapper.AgentMapper;
import com.lastmiletracker.agent.repository.AgentLocationRepository;
import com.lastmiletracker.agent.repository.DeliveryAgentRepository;
import com.lastmiletracker.exception.ResourceNotFoundException;
import com.lastmiletracker.order.entity.Order;
import com.lastmiletracker.order.entity.OrderStatus;
import com.lastmiletracker.order.repository.OrderRepository;
import com.lastmiletracker.tracking.dto.LiveLocationResponse;
import com.lastmiletracker.tracking.service.ETACalculationService;
import com.lastmiletracker.tracking.service.TrackingSocketService;
import com.lastmiletracker.user.entity.User;
import com.lastmiletracker.user.repository.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Slf4j
public class AgentService {

    private final DeliveryAgentRepository agentRepository;
    private final UserRepository userRepository;
    private final AgentMapper agentMapper;
    private final OrderRepository orderRepository;
    private final AgentLocationRepository agentLocationRepository;
    private final ETACalculationService etaCalculationService;
    private final TrackingSocketService trackingSocketService;

    public AgentService(
            DeliveryAgentRepository agentRepository,
            UserRepository userRepository,
            AgentMapper agentMapper,
            @Lazy OrderRepository orderRepository,
            AgentLocationRepository agentLocationRepository,
            ETACalculationService etaCalculationService,
            TrackingSocketService trackingSocketService) {
        this.agentRepository = agentRepository;
        this.userRepository = userRepository;
        this.agentMapper = agentMapper;
        this.orderRepository = orderRepository;
        this.agentLocationRepository = agentLocationRepository;
        this.etaCalculationService = etaCalculationService;
        this.trackingSocketService = trackingSocketService;
    }

    @Transactional(readOnly = true)
    public AgentProfileResponse getProfile(String email) {
        DeliveryAgent agent = agentRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery agent profile not found for email: " + email));
        return agentMapper.toResponse(agent);
    }

    @Transactional
    public AgentProfileResponse updateProfile(String email, AgentProfileUpdateRequest request) {
        DeliveryAgent agent = agentRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery agent profile not found"));

        User user = agent.getUser();
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());

        agent.setVehicleType(request.getVehicleType());
        agent.setLicenseNumber(request.getLicenseNumber());

        userRepository.save(user);
        DeliveryAgent savedAgent = agentRepository.save(agent);
        log.info("Delivery agent profile updated successfully for: {}", email);

        return agentMapper.toResponse(savedAgent);
    }

    @Transactional
    public AgentProfileResponse updateLocation(String email, LiveLocationRequest request) {
        DeliveryAgent agent = agentRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery agent profile not found"));

        agent.setLatitude(request.getLatitude());
        agent.setLongitude(request.getLongitude());
        DeliveryAgent savedAgent = agentRepository.save(agent);
        log.info("Agent coordinates updated in profile for {}: ({}, {})", email, request.getLatitude(), request.getLongitude());

        // Save or update OneToOne AgentLocation
        AgentLocation agentLocation = agentLocationRepository.findByAgent(savedAgent)
                .orElseGet(() -> AgentLocation.builder().agent(savedAgent).build());
        agentLocation.setLatitude(request.getLatitude());
        agentLocation.setLongitude(request.getLongitude());
        agentLocation.setSpeed(request.getSpeed());
        agentLocation.setHeading(request.getHeading());
        agentLocation.setAccuracy(request.getAccuracy());
        agentLocation.setBatteryLevel(request.getBatteryLevel());
        agentLocation.setLastUpdated(LocalDateTime.now());
        agentLocationRepository.save(agentLocation);

        log.info("Agent location entity persisted: agentId={}, battery={}%", savedAgent.getId(), request.getBatteryLevel());

        // Resolve active orders for this agent
        List<Order> activeOrders = orderRepository.findAll().stream()
                .filter(o -> o.getAssignedAgent() != null && o.getAssignedAgent().getId().equals(savedAgent.getId()))
                .filter(o -> o.getStatus() != OrderStatus.DELIVERED 
                        && o.getStatus() != OrderStatus.FAILED 
                        && o.getStatus() != OrderStatus.CANCELLED)
                .toList();

        for (Order order : activeOrders) {
            int eta = etaCalculationService.calculateETA(
                    savedAgent.getLatitude(),
                    savedAgent.getLongitude(),
                    request.getSpeed(),
                    order.getDeliveryPincode()
            );

            LiveLocationResponse locationResponse = LiveLocationResponse.builder()
                    .agentId(savedAgent.getId())
                    .trackingNumber(order.getTrackingNumber())
                    .orderId(order.getId())
                    .latitude(request.getLatitude())
                    .longitude(request.getLongitude())
                    .speed(request.getSpeed())
                    .heading(request.getHeading())
                    .accuracy(request.getAccuracy())
                    .batteryLevel(request.getBatteryLevel())
                    .status(order.getStatus().name())
                    .timestamp(LocalDateTime.now())
                    .eta(eta)
                    .build();

            // Broadcast live coordinates
            trackingSocketService.broadcastLiveLocation(locationResponse);
            // Broadcast ETA updates
            trackingSocketService.broadcastETA(order.getTrackingNumber(), eta, order.getId());
        }

        return agentMapper.toResponse(savedAgent);
    }

    @Transactional
    public AgentProfileResponse updateAvailability(String email, boolean available) {
        DeliveryAgent agent = agentRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery agent profile not found"));

        agent.setAvailable(available);
        DeliveryAgent savedAgent = agentRepository.save(agent);
        log.info("Agent availability status changed to {} for user {}", available, email);

        return agentMapper.toResponse(savedAgent);
    }

    @Transactional
    public void createProfile(User user) {
        DeliveryAgent agent = DeliveryAgent.builder()
                .user(user)
                .available(false)
                .latitude(0.0)
                .longitude(0.0)
                .vehicleType("")
                .licenseNumber("")
                .build();
        agentRepository.save(agent);
        log.info("Blank delivery agent profile created for registered user: {}", user.getEmail());
    }
}
