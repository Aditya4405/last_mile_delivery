package com.lastmiletracker.area.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AreaRequest {

    @NotBlank(message = "Area name is required")
    private String name;

    @NotBlank(message = "Pincode is required")
    @Size(min = 6, max = 6, message = "Pincode must be exactly 6 digits")
    @Pattern(regexp = "^[0-9]{6}$", message = "Pincode must contain only digits")
    private String pincode;

    @NotNull(message = "Zone ID is required")
    private Long zoneId;
}
