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
public class RevenueReportResponse {

    @Schema(description = "Revenue metrics summary")
    private Map<String, Object> summary;

    @Schema(description = "Revenue chart distribution")
    private List<Map<String, Object>> chartData;
}
