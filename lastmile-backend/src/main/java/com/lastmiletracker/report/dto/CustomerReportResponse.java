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
public class CustomerReportResponse {

    @Schema(description = "Total registered customer accounts", example = "50")
    private Long totalCustomers;

    @Schema(description = "Count of customers who booked at least once", example = "38")
    private Long activeCustomers;

    @Schema(description = "Riders workload and metrics mappings")
    private List<Map<String, Object>> chartData;
}
