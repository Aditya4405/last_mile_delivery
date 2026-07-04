package com.lastmiletracker.report.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportSummaryResponse {

    @Schema(description = "Total revenue collected", example = "42000.0")
    private Double totalRevenue;

    @Schema(description = "Total orders placed", example = "150")
    private Long totalOrders;

    @Schema(description = "Delivered orders count", example = "120")
    private Long delivered;

    @Schema(description = "Cancelled orders count", example = "10")
    private Long cancelled;

    @Schema(description = "COD collections pending", example = "3500.0")
    private Double codPending;

    @Schema(description = "Average delivery completion time in hours", example = "3.4")
    private Double avgDeliveryTime;
}
