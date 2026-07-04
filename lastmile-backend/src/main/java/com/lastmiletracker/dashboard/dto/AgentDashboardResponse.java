package com.lastmiletracker.dashboard.dto;

import com.lastmiletracker.order.dto.OrderResponse;
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
public class AgentDashboardResponse {

    @Schema(description = "Agent availability status flag", example = "true")
    private boolean available;

    @Schema(description = "Current shift workload status", example = "ON_DUTY")
    private String shiftStatus;

    @Schema(description = "Total shipments assigned today", example = "8")
    private Long todayOrdersCount;

    @Schema(description = "Count of shipments pending pickup today", example = "2")
    private Long pendingPickupsCount;

    @Schema(description = "Count of shipments successfully delivered today", example = "5")
    private Long deliveredTodayCount;

    @Schema(description = "Count of failed shipment delivery attempts today", example = "1")
    private Long failedAttemptsCount;

    @Schema(description = "Agent performance rating percentage (0-100)", example = "94.5")
    private Double performanceScore;

    @Schema(description = "Current active delivery metadata")
    private OrderResponse currentActiveDelivery;

    @Schema(description = "Delivery agent profile details")
    private Map<String, Object> profileSummary;
}
