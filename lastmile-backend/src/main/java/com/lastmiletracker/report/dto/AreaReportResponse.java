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
public class AreaReportResponse {

    @Schema(description = "Total number of areas configured", example = "25")
    private Long totalAreas;

    @Schema(description = "Top operational delivery area city name", example = "Noida")
    private String topArea;

    @Schema(description = "Area-wise distribution of booking metrics")
    private List<Map<String, Object>> areaDistribution;
}
