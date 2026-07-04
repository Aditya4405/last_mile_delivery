package com.lastmiletracker.tracking.controller;

import com.lastmiletracker.common.response.ApiResponse;
import com.lastmiletracker.exception.ResourceNotFoundException;
import com.lastmiletracker.tracking.dto.LiveLocationResponse;
import com.lastmiletracker.tracking.dto.TrackingResponse;
import com.lastmiletracker.tracking.service.TrackingService;
import com.lastmiletracker.user.entity.User;
import com.lastmiletracker.user.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/tracking")
@Tag(name = "Shipment Tracking Controller", description = "Endpoints to view shipment routing timeline milestones, real-time live coordinates, and calculated ETAs")
public class TrackingController {

    private final TrackingService trackingService;
    private final UserRepository userRepository;

    public TrackingController(TrackingService trackingService, UserRepository userRepository) {
        this.trackingService = trackingService;
        this.userRepository = userRepository;
    }

    @GetMapping("/{trackingNumber}")
    @Operation(summary = "Public tracking timeline lookup by tracking number")
    public ResponseEntity<ApiResponse<TrackingResponse>> getTimelineByTrackingNumber(
            @PathVariable String trackingNumber) {
        TrackingResponse response = trackingService.getTrackingTimeline(trackingNumber);
        return ResponseEntity.ok(ApiResponse.success("Shipment timeline fetched successfully!", response));
    }

    @GetMapping("/history/{id}")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Authenticated tracking timeline lookup by order database ID")
    public ResponseEntity<ApiResponse<TrackingResponse>> getTimelineByOrderId(
            @PathVariable Long id) {
        TrackingResponse response = trackingService.getTrackingTimelineByOrderId(id);
        return ResponseEntity.ok(ApiResponse.success("Shipment timeline history fetched successfully!", response));
    }

    @GetMapping("/live/{trackingNumber}")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Retrieve latest real-time coordinates of the assigned delivery agent")
    public ResponseEntity<ApiResponse<LiveLocationResponse>> getLiveLocation(
            @PathVariable String trackingNumber) {
        User user = getAuthenticatedUser();
        LiveLocationResponse response = trackingService.getLiveLocation(trackingNumber, user);
        return ResponseEntity.ok(ApiResponse.success("Live coordinates retrieved successfully!", response));
    }

    @GetMapping("/eta/{trackingNumber}")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Retrieve dynamic estimated time of arrival (ETA) in minutes")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getETA(
            @PathVariable String trackingNumber) {
        User user = getAuthenticatedUser();
        int etaMinutes = trackingService.getETA(trackingNumber, user);
        return ResponseEntity.ok(ApiResponse.success("Calculated ETA retrieved successfully!", Map.of("eta", etaMinutes)));
    }

    @GetMapping("/agent/{agentId}")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Retrieve latest coordinates for a specific delivery agent ID")
    public ResponseEntity<ApiResponse<LiveLocationResponse>> getAgentLiveLocation(
            @PathVariable Long agentId) {
        User user = getAuthenticatedUser();
        LiveLocationResponse response = trackingService.getAgentLiveLocation(agentId, user);
        return ResponseEntity.ok(ApiResponse.success("Agent live coordinates retrieved successfully!", response));
    }

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user profile not found"));
    }
}
