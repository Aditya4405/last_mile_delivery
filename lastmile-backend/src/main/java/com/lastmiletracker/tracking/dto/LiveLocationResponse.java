package com.lastmiletracker.tracking.dto;

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
public class LiveLocationResponse {

    @Schema(description = "ID of the delivery agent", example = "1")
    private Long agentId;

    @Schema(description = "Shipment tracking number", example = "LM260703483921")
    private String trackingNumber;

    @Schema(description = "ID of the order", example = "5")
    private Long orderId;

    @Schema(description = "Current latitude coordinate", example = "28.5355")
    private Double latitude;

    @Schema(description = "Current longitude coordinate", example = "77.3910")
    private Double longitude;

    @Schema(description = "Current speed of travel", example = "42.0")
    private Double speed;

    @Schema(description = "Current heading of travel", example = "90.0")
    private Double heading;

    @Schema(description = "Location accuracy metric", example = "4.5")
    private Double accuracy;

    @Schema(description = "Agent device battery level percentage", example = "78.0")
    private Double batteryLevel;

    @Schema(description = "Current status of the shipment", example = "OUT_FOR_DELIVERY")
    private String status;

    @Schema(description = "Timestamp of location update")
    private LocalDateTime timestamp;

    @Schema(description = "Calculated ETA in minutes", example = "12")
    private Integer eta;
}
