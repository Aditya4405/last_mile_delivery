package com.lastmiletracker.notification.controller;

import com.lastmiletracker.common.response.ApiResponse;
import com.lastmiletracker.notification.dto.NotificationResponse;
import com.lastmiletracker.notification.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@Tag(name = "Notification Controller", description = "Endpoints for managing user notification inboxes (marking as read, unread filters)")
@SecurityRequirement(name = "bearerAuth")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping
    @Operation(summary = "Get user inbox notifications (All or Unread only)")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getUserNotifications(
            @RequestParam(required = false) Boolean unreadOnly) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        List<NotificationResponse> response = notificationService.getUserNotifications(email, unreadOnly);
        return ResponseEntity.ok(ApiResponse.success("Notifications fetched successfully!", response));
    }

    @PutMapping("/{id}/read")
    @Operation(summary = "Mark a specific notification as read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read successfully."));
    }

    @PutMapping("/read-all")
    @Operation(summary = "Mark all unread notifications in inbox as read")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        notificationService.markAllAsRead(email);
        return ResponseEntity.ok(ApiResponse.success("All notifications marked as read."));
    }
}
