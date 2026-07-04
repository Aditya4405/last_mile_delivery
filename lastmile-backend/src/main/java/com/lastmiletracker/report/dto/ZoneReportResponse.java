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
public class ZoneReportResponse {

    @Schema(description = "Total number of zones", example = "5")
    private Long totalZones;

    @Schema(description = "Top operational pickup zone name", example = "Central Zone")
    private String topZone;

    @Schema(description = "Zone-wise distribution of booking metrics")
    private List<Map<String, Object>> zoneDistribution;
}
