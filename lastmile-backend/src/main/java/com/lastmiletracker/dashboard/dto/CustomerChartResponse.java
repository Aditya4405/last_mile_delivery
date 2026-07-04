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
public class CustomerChartResponse {

    @Schema(description = "Weekly spending metrics formatted for React chart libraries")
    private List<Map<String, Object>> weeklySpending;

    @Schema(description = "Monthly spending metrics formatted for React chart libraries")
    private List<Map<String, Object>> monthlySpending;

    @Schema(description = "Shipment status distribution count mapping")
    private List<Map<String, Object>> statusDistribution;
}
