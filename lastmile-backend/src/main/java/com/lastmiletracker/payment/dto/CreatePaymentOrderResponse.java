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
public class CreatePaymentOrderResponse {

    @Schema(description = "Razorpay-generated Order ID", example = "order_O8x9Hn2hK9n3L1")
    private String razorpayOrderId;

    @Schema(description = "Amount in paise (multiplier of 100 for payment gateways)", example = "7500")
    private Long amount;

    @Schema(description = "Currency type", example = "INR")
    private String currency;

    @Schema(description = "Razorpay Public Key", example = "rzp_test_T98uakJBS29XZ1")
    private String razorpayKey;

    @Schema(description = "Internal database Order ID link", example = "10")
    private Long orderId;
}
