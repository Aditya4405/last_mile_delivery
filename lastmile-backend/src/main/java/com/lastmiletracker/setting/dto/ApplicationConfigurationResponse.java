package com.lastmiletracker.setting.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ApplicationConfigurationResponse {

    @Schema(description = "Map of all active application-level key-value settings configs")
    private Map<String, String> configurations;
}
