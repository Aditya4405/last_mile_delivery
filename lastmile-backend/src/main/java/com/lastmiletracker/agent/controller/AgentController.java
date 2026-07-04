package com.lastmiletracker.agent.controller;

import com.lastmiletracker.agent.dto.LiveLocationRequest;
import com.lastmiletracker.agent.dto.AgentProfileResponse;
import com.lastmiletracker.agent.dto.AgentProfileUpdateRequest;
import com.lastmiletracker.agent.service.AgentService;
import com.lastmiletracker.common.response.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.lastmiletracker.agent.dto.AgentDashboardResponse;
import com.lastmiletracker.order.repository.OrderRepository;
import com.lastmiletracker.order.entity.Order;
import com.lastmiletracker.order.entity.OrderStatus;
import com.lastmiletracker.order.mapper.OrderMapper;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/agents")
@Tag(name = "Delivery Agent Controller", description = "Endpoints for managing delivery agent profiles, coordinates, and availability status")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('DELIVERY_AGENT')")
public class AgentController {

    private final AgentService agentService;
    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;

    public AgentController(
            AgentService agentService,
            OrderRepository orderRepository,
            OrderMapper orderMapper) {
        this.agentService = agentService;
        this.orderRepository = orderRepository;
        this.orderMapper = orderMapper;
    }

    @GetMapping("/profile")
    @Operation(summary = "Get the authenticated agent's profile details")
    public ResponseEntity<ApiResponse<AgentProfileResponse>> getProfile() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        AgentProfileResponse response = agentService.getProfile(email);
        return ResponseEntity.ok(ApiResponse.success("Profile fetched successfully!", response));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update the authenticated agent's profile details")
    public ResponseEntity<ApiResponse<AgentProfileResponse>> updateProfile(
            @Valid @RequestBody AgentProfileUpdateRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        AgentProfileResponse response = agentService.updateProfile(email, request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully!", response));
    }

    @PutMapping("/availability")
    @Operation(summary = "Toggle delivery agent availability status (online/offline)")
    public ResponseEntity<ApiResponse<AgentProfileResponse>> updateAvailability(
            @RequestParam boolean available) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        AgentProfileResponse response = agentService.updateAvailability(email, available);
        return ResponseEntity.ok(ApiResponse.success("Availability updated successfully!", response));
    }

    @PutMapping("/location")
    @Operation(summary = "Ping delivery agent's current GPS coordinates")
    public ResponseEntity<ApiResponse<AgentProfileResponse>> updateLocation(
            @Valid @RequestBody LiveLocationRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        AgentProfileResponse response = agentService.updateLocation(email, request);
        return ResponseEntity.ok(ApiResponse.success("Location updated successfully!", response));
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get delivery agent dashboard statistics")
    public ResponseEntity<ApiResponse<AgentDashboardResponse>> getDashboardStats() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        List<Order> orders = orderRepository.findAll().stream()
                .filter(o -> o.getAssignedAgent() != null && o.getAssignedAgent().getUser().getEmail().equals(email))
                .collect(Collectors.toList());

        long assignedDeliveries = orders.size();
        
        long completedDeliveries = orders.stream()
                .filter(o -> o.getStatus() == OrderStatus.DELIVERED)
                .count();

        long pendingDeliveries = orders.stream()
                .filter(o -> o.getStatus() != OrderStatus.DELIVERED 
                        && o.getStatus() != OrderStatus.FAILED 
                        && o.getStatus() != OrderStatus.CANCELLED)
                .count();

        List<com.lastmiletracker.order.dto.OrderResponse> recentAssignments = orders.stream()
                .sorted((o1, o2) -> o2.getCreatedAt().compareTo(o1.getCreatedAt()))
                .limit(5)
                .map(orderMapper::toResponse)
                .collect(Collectors.toList());

        AgentDashboardResponse response = AgentDashboardResponse.builder()
                .assignedDeliveries(assignedDeliveries)
                .completedDeliveries(completedDeliveries)
                .pendingDeliveries(pendingDeliveries)
                .recentAssignments(recentAssignments)
                .build();

        return ResponseEntity.ok(ApiResponse.success("Agent dashboard statistics fetched successfully!", response));
    }
}
