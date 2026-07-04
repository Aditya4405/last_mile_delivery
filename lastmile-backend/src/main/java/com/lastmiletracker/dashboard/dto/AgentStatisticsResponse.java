package com.lastmiletracker.dashboard.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AgentStatisticsResponse {

    @Schema(description = "Count of assigned shipments today", example = "8")
    private Long todayOrders;

    @Schema(description = "Count of pending pickups today", example = "2")
    private Long pendingPickups;

    @Schema(description = "Count of delivered shipments today", example = "5")
    private Long deliveredToday;

    @Schema(description = "Count of failed shipment deliveries today", example = "1")
    private Long failedDeliveries;

    @Schema(description = "Current assigned order ID", example = "3")
    private Long currentAssignmentId;

    @Schema(description = "Current assigned order tracking number", example = "LM260703483921")
    private String currentAssignmentTrackingNumber;

    @Schema(description = "Agent's current live location coordinates")
    private Map<String, Double> liveCoordinates;

    @Schema(description = "Agent overall quality rating percentage", example = "95.8")
    private Double performanceScore;

    @Schema(description = "Average delivery turnaround duration in minutes", example = "34.5")
    private Double averageDeliveryTime;

    @Schema(description = "Successful delivery completion rate percentage", example = "97.4")
    private Double successRate;

    @Schema(description = "Current shift workload status", example = "ACTIVE")
    private String currentShiftStatus;
}
