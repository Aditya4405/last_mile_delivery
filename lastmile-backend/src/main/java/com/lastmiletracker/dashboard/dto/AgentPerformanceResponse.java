package com.lastmiletracker.dashboard.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AgentPerformanceResponse {

    @Schema(description = "Overall quality rating percentage", example = "96.5")
    private Double performanceScore;

    @Schema(description = "Average delivery run time in minutes", example = "32.0")
    private Double averageDeliveryTimeMinutes;

    @Schema(description = "Delivery success rate percentage", example = "98.2")
    private Double successRate;

    @Schema(description = "Delivered shipments count today", example = "5")
    private Long deliveredToday;

    @Schema(description = "Total lifetime shipments delivered", example = "240")
    private Long totalDelivered;

    @Schema(description = "Total lifetime shipments assigned", example = "248")
    private Long totalAssigned;
}
