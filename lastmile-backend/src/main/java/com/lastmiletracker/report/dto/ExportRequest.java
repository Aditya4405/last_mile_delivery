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
public class ExportRequest {

    @Schema(description = "Type of the report template to export", example = "orders")
    private String reportType;

    @Schema(description = "Applied filter criteria")
    private ReportFilterRequest filters;
}
