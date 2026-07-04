package com.lastmiletracker.agent.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LiveLocationRequest {

    @Schema(description = "Latitude of the delivery agent", example = "28.5355")
    @NotNull(message = "Latitude is required")
    private Double latitude;

    @Schema(description = "Longitude of the delivery agent", example = "77.3910")
    @NotNull(message = "Longitude is required")
    private Double longitude;

    @Schema(description = "Speed of the delivery agent in km/h", example = "35.5")
    private Double speed;

    @Schema(description = "Direction of travel in degrees (0-360)", example = "180.0")
    private Double heading;

    @Schema(description = "Location accuracy radius in meters", example = "5.0")
    private Double accuracy;

    @Schema(description = "Agent device battery level percentage (0-100)", example = "85.0")
    private Double batteryLevel;
}
