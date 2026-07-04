package com.lastmiletracker.setting.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SettingsCategoryResponse {

    @Schema(description = "Category name code", example = "GENERAL")
    private String category;

    @Schema(description = "Settings records list belonging to this category")
    private List<SystemSettingResponse> settings;
}
