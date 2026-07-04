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
public class CustomerStatisticsResponse {

    @Schema(description = "Total shipments placed", example = "15")
    private Long totalShipments;

    @Schema(description = "Total shipments currently pending", example = "4")
    private Long pending;

    @Schema(description = "Total shipments delivered", example = "9")
    private Long delivered;

    @Schema(description = "Total shipments cancelled", example = "1")
    private Long cancelled;

    @Schema(description = "Total shipments failed", example = "1")
    private Long failed;

    @Schema(description = "Total money spent on deliveries", example = "5250.0")
    private Double totalMoneySpent;

    @Schema(description = "Pending Cash-On-Delivery collections", example = "1800.0")
    private Double codPending;
}
