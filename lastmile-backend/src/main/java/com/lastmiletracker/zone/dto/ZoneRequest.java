package com.lastmiletracker.zone.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ZoneRequest {

    @NotBlank(message = "Zone name is required")
    private String name;

    private String description;
}
