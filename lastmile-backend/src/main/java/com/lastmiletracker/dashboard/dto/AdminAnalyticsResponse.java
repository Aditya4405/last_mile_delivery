package com.lastmiletracker.dashboard.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminAnalyticsResponse {

    @Schema(description = "Total orders placed", example = "150")
    private Long totalOrders;

    @Schema(description = "Count of pending orders", example = "20")
    private Long pendingOrders;

    @Schema(description = "Count of delivered orders", example = "120")
    private Long deliveredOrders;

    @Schema(description = "Count of cancelled orders", example = "5")
    private Long cancelledOrders;

    @Schema(description = "Count of failed orders", example = "5")
    private Long failedOrders;

    @Schema(description = "Count of orders in transit", example = "8")
    private Long ordersInTransit;

    @Schema(description = "Count of orders out for delivery", example = "4")
    private Long ordersOutForDelivery;

    @Schema(description = "Total customers in database", example = "60")
    private Long totalCustomers;

    @Schema(description = "Count of active customers (who have ordered)", example = "35")
    private Long activeCustomers;

    @Schema(description = "Total agents in database", example = "20")
    private Long totalAgents;

    @Schema(description = "Count of available agents", example = "8")
    private Long availableAgents;

    @Schema(description = "Count of busy agents (assigned to active orders)", example = "5")
    private Long busyAgents;

    @Schema(description = "Count of offline/unavailable agents", example = "7")
    private Long offlineAgents;

    @Schema(description = "Average delivery turnaround duration in minutes", example = "38.5")
    private Double averageDeliveryTime;

    @Schema(description = "Overall system delivery success rate percentage", example = "96.5")
    private Double successRate;

    @Schema(description = "Top delivery agent by count of completed runs")
    private Map<String, Object> topDeliveryAgent;

    @Schema(description = "Top customer by booking volume and shipping spending")
    private Map<String, Object> topCustomer;

    @Schema(description = "Top pickup zone by booking volumes")
    private Map<String, Object> topZone;

    @Schema(description = "Top delivery city area by count of bookings")
    private Map<String, Object> topArea;

    @Schema(description = "Booking counts distributed by operational pickup zones")
    private List<Map<String, Object>> zoneDistribution;

    @Schema(description = "System weekly delivery counts trends for React charts mapping")
    private List<Map<String, Object>> weeklyDeliveries;

    @Schema(description = "System monthly delivery counts trends for React charts mapping")
    private List<Map<String, Object>> monthlyDeliveries;
}
