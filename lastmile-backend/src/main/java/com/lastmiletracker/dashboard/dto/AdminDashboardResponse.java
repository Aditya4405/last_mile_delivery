package com.lastmiletracker.dashboard.dto;

import com.lastmiletracker.order.dto.OrderResponse;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminDashboardResponse {

    @Schema(description = "Total shipping revenue collected", example = "24000.0")
    private Double totalDeliveryCharges;

    @Schema(description = "Total shipments placed in system", example = "120")
    private Long totalShipments;

    @Schema(description = "Count of active customer accounts", example = "45")
    private Long activeClients;

    @Schema(description = "Count of active delivery executive profiles", example = "15")
    private Long activeDeliveryExecutives;

    @Schema(description = "Count of active shipments pending pickup", example = "12")
    private Long pendingPickups;

    @Schema(description = "Overall system delivery completion success rate percentage", example = "96.4")
    private Double successRate;

    @Schema(description = "Lightweight list of recent system orders")
    private List<OrderResponse> recentOrders;
}
