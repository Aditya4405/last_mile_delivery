package com.lastmiletracker.payment.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreatePaymentOrderRequest {

    @Schema(description = "Internal Order ID to link transaction with", example = "10")
    private Long orderId;

    @Schema(description = "Details of the shipment to calculate shipping charge and validate")
    private com.lastmiletracker.order.dto.OrderRequest orderDetails;
}
