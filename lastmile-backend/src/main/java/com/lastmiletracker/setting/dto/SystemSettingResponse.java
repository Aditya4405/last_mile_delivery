package com.lastmiletracker.setting.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemSettingResponse {

    @Schema(description = "Database Primary Key ID", example = "1")
    private Long id;

    @Schema(description = "Unique configuration lookup key", example = "COMPANY_NAME")
    private String settingKey;

    @Schema(description = "Configuration value string", example = "LogiTrack Express")
    private String settingValue;

    @Schema(description = "Category grouping code", example = "GENERAL")
    private String category;

    @Schema(description = "Setting purpose details", example = "Company official business name")
    private String description;

    @Schema(description = "Flag indicating edit permissions restrictions", example = "true")
    private boolean editable;

    @Schema(description = "Created date timestamp")
    private LocalDateTime createdAt;

    @Schema(description = "Updated date timestamp")
    private LocalDateTime updatedAt;
}
