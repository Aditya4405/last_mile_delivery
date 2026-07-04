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
public class AdminRevenueResponse {

    @Schema(description = "Total revenue collected since system launch", example = "48000.0")
    private Double totalRevenue;

    @Schema(description = "Total revenue collected today", example = "1200.0")
    private Double todayRevenue;

    @Schema(description = "Total revenue collected during the current month", example = "15500.0")
    private Double monthlyRevenue;

    @Schema(description = "Total revenue collected during the current calendar year", example = "35000.0")
    private Double yearlyRevenue;

    @Schema(description = "Average shipping charge per order", example = "325.5")
    private Double averageShippingCost;

    @Schema(description = "Revenue metrics trends for React charts mapping")
    private List<Map<String, Object>> revenueTrends;
}
