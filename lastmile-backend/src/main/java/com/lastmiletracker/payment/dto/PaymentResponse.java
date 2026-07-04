package com.lastmiletracker.payment.dto;

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
public class PaymentResponse {

    @Schema(description = "Database Primary Key ID", example = "1")
    private Long id;

    @Schema(description = "System-generated unique payment reference code", example = "PAY-2607049811")
    private String paymentId;

    @Schema(description = "Razorpay order reference code", example = "order_O8x9Hn2hK9n3L1")
    private String razorpayOrderId;

    @Schema(description = "Razorpay payment transaction code", example = "pay_P9n1Hw8hL9z1")
    private String razorpayPaymentId;

    @Schema(description = "Captured shipping charge amount", example = "420.0")
    private Double amount;

    @Schema(description = "Currency format code", example = "INR")
    private String currency;

    @Schema(description = "Transaction lifecycle status", example = "CAPTURED")
    private String status;

    @Schema(description = "Payment mode categorization", example = "UPI")
    private String paymentMethod;

    @Schema(description = "System transaction reference code", example = "TXN-8392109821")
    private String transactionReference;

    @Schema(description = "Generated tax Invoice number", example = "INV-20260704-00001")
    private String invoiceNumber;

    @Schema(description = "Optional transaction remarks or descriptors", example = "Razorpay online payment captured successfully")
    private String remarks;

    @Schema(description = "Created date timestamp")
    private LocalDateTime createdAt;

    @Schema(description = "Updated date timestamp")
    private LocalDateTime updatedAt;

    @Schema(description = "Linked consignment order ID", example = "10")
    private Long orderId;

    @Schema(description = "Linked consignment order tracking number", example = "LM260704983201")
    private String trackingNumber;

    @Schema(description = "Sender customer full name", example = "Aditya Kumar")
    private String customerName;
}
