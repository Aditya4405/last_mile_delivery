package com.lastmiletracker.setting.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemSettingRequest {

    @Schema(description = "Value configuration string", example = "LogiTrack Express")
    private String settingValue;

    @Schema(description = "Category grouping description", example = "GENERAL")
    private String category;

    @Schema(description = "Optional configuration purpose description", example = "Company official business name")
    private String description;
}
