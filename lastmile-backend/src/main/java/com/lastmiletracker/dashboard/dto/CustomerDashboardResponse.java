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
public class CustomerDashboardResponse {

    @Schema(description = "Welcome banner message", example = "Welcome back, Rahul Sharma!")
    private String welcomeMessage;

    @Schema(description = "Total shipments booked by the customer", example = "12")
    private Long totalShipments;

    @Schema(description = "Active pending shipments count", example = "3")
    private Long pendingShipments;

    @Schema(description = "Completed delivered shipments count", example = "8")
    private Long deliveredShipments;

    @Schema(description = "Total billing charges spent by customer", example = "4500.0")
    private Double totalMoneySpent;

    @Schema(description = "Lightweight profile summary parameters")
    private Map<String, Object> profileSummary;

    @Schema(description = "Latest booking tracking update")
    private OrderResponse latestTracking;
}
