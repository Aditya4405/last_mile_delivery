package com.lastmiletracker.dashboard.controller;

import com.lastmiletracker.common.response.ApiResponse;
import com.lastmiletracker.dashboard.dto.*;
import com.lastmiletracker.dashboard.service.DashboardService;
import com.lastmiletracker.order.dto.OrderResponse;
import com.lastmiletracker.notification.dto.NotificationResponse;
import com.lastmiletracker.tracking.dto.LiveLocationResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@Tag(name = "Dashboard Controller", description = "Endpoints supplying cards, counts, graphs, maps, routes, and widgets for Customer, Agent, and Admin React dashboard views")
@SecurityRequirement(name = "bearerAuth")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    /* ===========================================================
       Customer Dashboard Endpoints
       =========================================================== */

    @GetMapping("/api/dashboard/customer")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Get Customer Dashboard overview state (Total shipments, spending, and profile details)")
    public ResponseEntity<ApiResponse<CustomerDashboardResponse>> getCustomerDashboard() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        CustomerDashboardResponse response = dashboardService.getCustomerDashboard(email);
        return ResponseEntity.ok(ApiResponse.success("Customer dashboard fetched successfully!", response));
    }

    @GetMapping("/api/dashboard/customer/recent-shipments")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Get Customer's lightweight recent shipments list")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getCustomerRecentShipments() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        List<OrderResponse> response = dashboardService.getCustomerRecentShipments(email);
        return ResponseEntity.ok(ApiResponse.success("Recent shipments fetched successfully!", response));
    }

    @GetMapping("/api/dashboard/customer/chart")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Get Customer's weekly and monthly shipping spending trends formatted for React chart libraries")
    public ResponseEntity<ApiResponse<CustomerChartResponse>> getCustomerChart() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        CustomerChartResponse response = dashboardService.getCustomerChart(email);
        return ResponseEntity.ok(ApiResponse.success("Chart metrics fetched successfully!", response));
    }

    @GetMapping("/api/dashboard/customer/help-center")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Get Help Center FAQ list for customer support FAQs widget")
    public ResponseEntity<ApiResponse<List<FAQResponse>>> getCustomerHelpCenter() {
        List<FAQResponse> response = dashboardService.getFAQs();
        return ResponseEntity.ok(ApiResponse.success("FAQ list retrieved successfully!", response));
    }

    @GetMapping("/api/dashboard/customer/notifications")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Get Customer's recent notification logs")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getCustomerNotifications() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        List<NotificationResponse> response = dashboardService.getCustomerNotifications(email);
        return ResponseEntity.ok(ApiResponse.success("Notifications retrieved successfully!", response));
    }

    @GetMapping("/api/dashboard/customer/statistics")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Get Customer's detailed count statistics (Pending, delivered, cancelled, spent, COD pending)")
    public ResponseEntity<ApiResponse<CustomerStatisticsResponse>> getCustomerStatistics() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        CustomerStatisticsResponse response = dashboardService.getCustomerStatistics(email);
        return ResponseEntity.ok(ApiResponse.success("Detailed statistics fetched successfully!", response));
    }

    /* ===========================================================
       Delivery Agent Dashboard Endpoints
       =========================================================== */

    @GetMapping("/api/dashboard/agent")
    @PreAuthorize("hasAnyRole('DELIVERY_AGENT', 'ADMIN')")
    @Operation(summary = "Get Delivery Agent Dashboard overview (availability, shift workload, and today's metrics)")
    public ResponseEntity<ApiResponse<AgentDashboardResponse>> getAgentDashboard() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        AgentDashboardResponse response = dashboardService.getAgentDashboard(email);
        return ResponseEntity.ok(ApiResponse.success("Agent dashboard fetched successfully!", response));
    }

    @GetMapping("/api/dashboard/agent/performance")
    @PreAuthorize("hasAnyRole('DELIVERY_AGENT', 'ADMIN')")
    @Operation(summary = "Get Agent's performance metrics (satisfaction ratings, average delivery times, success rate)")
    public ResponseEntity<ApiResponse<AgentPerformanceResponse>> getAgentPerformance() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        AgentPerformanceResponse response = dashboardService.getAgentPerformance(email);
        return ResponseEntity.ok(ApiResponse.success("Agent performance metrics retrieved!", response));
    }

    @GetMapping("/api/dashboard/agent/current-route")
    @PreAuthorize("hasAnyRole('DELIVERY_AGENT', 'ADMIN')")
    @Operation(summary = "Get coordinate coordinates path mapping for agent's current active delivery route")
    public ResponseEntity<ApiResponse<AgentRouteResponse>> getAgentCurrentRoute() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        AgentRouteResponse response = dashboardService.getAgentCurrentRoute(email);
        return ResponseEntity.ok(ApiResponse.success("Current assigned delivery route route coordinates fetched!", response));
    }

    @GetMapping("/api/dashboard/agent/current-location")
    @PreAuthorize("hasAnyRole('DELIVERY_AGENT', 'ADMIN')")
    @Operation(summary = "Get Delivery Agent's latest live GPS coordinate updates")
    public ResponseEntity<ApiResponse<LiveLocationResponse>> getAgentCurrentLocation() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        LiveLocationResponse response = dashboardService.getAgentCurrentLocation(email);
        return ResponseEntity.ok(ApiResponse.success("Current live GPS location coordinates fetched!", response));
    }

    @GetMapping("/api/dashboard/agent/assigned-orders")
    @PreAuthorize("hasAnyRole('DELIVERY_AGENT', 'ADMIN')")
    @Operation(summary = "Get all shipments assigned to the delivery agent")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getAgentAssignedOrders() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        List<OrderResponse> response = dashboardService.getAgentAssignedOrders(email);
        return ResponseEntity.ok(ApiResponse.success("Assigned orders list fetched successfully!", response));
    }

    @GetMapping("/api/dashboard/agent/statistics")
    @PreAuthorize("hasAnyRole('DELIVERY_AGENT', 'ADMIN')")
    @Operation(summary = "Get Agent's detailed count statistics (today's totals, ratings, current ETA, shift status)")
    public ResponseEntity<ApiResponse<AgentStatisticsResponse>> getAgentStatistics() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        AgentStatisticsResponse response = dashboardService.getAgentStatistics(email);
        return ResponseEntity.ok(ApiResponse.success("Agent statistics fetched successfully!", response));
    }

    @PutMapping("/api/dashboard/agent/availability")
    @PreAuthorize("hasAnyRole('DELIVERY_AGENT', 'ADMIN')")
    @Operation(summary = "Toggle Delivery Agent shift availability status")
    public ResponseEntity<ApiResponse<Void>> updateAgentAvailability(@RequestParam boolean available) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        dashboardService.updateAgentAvailability(email, available);
        return ResponseEntity.ok(ApiResponse.success("Shift availability status toggled successfully!"));
    }

    /* ===========================================================
       Admin Dashboard Endpoints
       =========================================================== */

    @GetMapping("/api/dashboard/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get Admin Dashboard overview (total bookings, revenue totals, active clients counts)")
    public ResponseEntity<ApiResponse<AdminDashboardResponse>> getAdminDashboard() {
        AdminDashboardResponse response = dashboardService.getAdminDashboard();
        return ResponseEntity.ok(ApiResponse.success("Admin dashboard fetched successfully!", response));
    }

    @GetMapping("/api/dashboard/admin/fleet")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get fleet operations coordinates mapping for live tracking map widget")
    public ResponseEntity<ApiResponse<AdminFleetResponse>> getAdminFleet() {
        AdminFleetResponse response = dashboardService.getAdminFleet();
        return ResponseEntity.ok(ApiResponse.success("Fleet coordinates retrieved successfully!", response));
    }

    @GetMapping("/api/dashboard/admin/revenue")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get revenue analytics reports (today's, monthly, yearly, cost distributions)")
    public ResponseEntity<ApiResponse<AdminRevenueResponse>> getAdminRevenue() {
        AdminRevenueResponse response = dashboardService.getAdminRevenue();
        return ResponseEntity.ok(ApiResponse.success("Revenue analytics fetched successfully!", response));
    }

    @GetMapping("/api/dashboard/admin/analytics")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get Admin analytics reports (success rate, top zones/cities, average delivery times)")
    public ResponseEntity<ApiResponse<AdminAnalyticsResponse>> getAdminAnalytics() {
        AdminAnalyticsResponse response = dashboardService.getAdminAnalytics();
        return ResponseEntity.ok(ApiResponse.success("Admin analytics reports fetched successfully!", response));
    }

    @GetMapping("/api/dashboard/admin/recent-orders")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get lightweight list of recent system-wide orders")
    public ResponseEntity<ApiResponse<List<OrderResponse>>> getAdminRecentOrders() {
        List<OrderResponse> response = dashboardService.getAdminRecentOrders();
        return ResponseEntity.ok(ApiResponse.success("Recent system-wide orders fetched!", response));
    }

    @GetMapping("/api/dashboard/admin/recent-notifications")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get lightweight list of recent system-wide notifications")
    public ResponseEntity<ApiResponse<List<NotificationResponse>>> getAdminRecentNotifications() {
        List<NotificationResponse> response = dashboardService.getAdminRecentNotifications();
        return ResponseEntity.ok(ApiResponse.success("Recent system-wide notifications fetched!", response));
    }

    /* ===========================================================
       General / Public FAQs Endpoint
       =========================================================== */

    @GetMapping("/api/help/faqs")
    @Operation(summary = "Get Help Center FAQ list for customer and guest support views")
    public ResponseEntity<ApiResponse<List<FAQResponse>>> getFAQs() {
        List<FAQResponse> response = dashboardService.getFAQs();
        return ResponseEntity.ok(ApiResponse.success("FAQs retrieved successfully!", response));
    }
}
