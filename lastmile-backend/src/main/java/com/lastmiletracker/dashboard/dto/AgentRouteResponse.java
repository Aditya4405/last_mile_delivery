package com.lastmiletracker.dashboard.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AgentRouteResponse {

    @Schema(description = "ID of the shipment order", example = "3")
    private Long orderId;

    @Schema(description = "Shipment tracking number", example = "LM260703483921")
    private String trackingNumber;

    @Schema(description = "Current latitude coordinate of the agent", example = "28.5355")
    private Double agentLatitude;

    @Schema(description = "Current longitude coordinate of the agent", example = "77.3910")
    private Double agentLongitude;

    @Schema(description = "Pickup physical address description", example = "Plot 14, Sector 62")
    private String pickupAddress;

    @Schema(description = "Resolved pickup location latitude coordinate", example = "28.5355")
    private Double pickupLatitude;

    @Schema(description = "Resolved pickup location longitude coordinate", example = "77.3910")
    private Double pickupLongitude;

    @Schema(description = "Delivery destination address description", example = "House 210, MG Road")
    private String deliveryAddress;

    @Schema(description = "Resolved delivery location latitude coordinate", example = "28.4595")
    private Double deliveryLatitude;

    @Schema(description = "Resolved delivery location longitude coordinate", example = "77.0266")
    private Double deliveryLongitude;

    @Schema(description = "Current route transit status", example = "IN_TRANSIT")
    private String status;

    @Schema(description = "Calculated transit ETA in minutes", example = "15")
    private Integer etaMinutes;
}
