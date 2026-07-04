package com.lastmiletracker.report.dto;

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
public class DeliveryAgentReportResponse {

    @Schema(description = "Delivery executive summary stats")
    private Map<String, Object> summary;

    @Schema(description = "Riders workload and metrics mappings")
    private List<Map<String, Object>> chartData;
}
