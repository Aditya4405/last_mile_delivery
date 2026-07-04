package com.lastmiletracker.payment.controller;

import com.lastmiletracker.common.response.ApiResponse;
import com.lastmiletracker.payment.dto.*;
import com.lastmiletracker.payment.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@Tag(name = "Payment Controller", description = "Endpoints for managing customer checkout transactions, Razorpay signature validation, refunds, and webhook sync events")
@Slf4j
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/create-order")
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Initialize a transaction by creating a Razorpay checkout Order")
    public ResponseEntity<ApiResponse<CreatePaymentOrderResponse>> createPaymentOrder(
            @RequestBody CreatePaymentOrderRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        CreatePaymentOrderResponse response = paymentService.createRazorpayOrder(request, email);
        return ResponseEntity.ok(ApiResponse.success("Razorpay Order created successfully!", response));
    }

    @PostMapping("/verify")
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Verify the checkout client HMAC-SHA256 signature and capture payment")
    public ResponseEntity<ApiResponse<com.lastmiletracker.order.dto.OrderResponse>> verifyPaymentSignature(
            @RequestBody VerifyPaymentRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        com.lastmiletracker.order.dto.OrderResponse response = paymentService.verifyPaymentSignature(request, email);
        return ResponseEntity.ok(ApiResponse.success("Payment verified and captured successfully!", response));
    }

    @GetMapping("/history")
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get historical payments list")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getPaymentHistory() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        List<PaymentResponse> response = paymentService.getPaymentHistory(email);
        return ResponseEntity.ok(ApiResponse.success("Payment history retrieved successfully!", response));
    }

    @GetMapping("/{paymentId}")
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get transaction details of a specific payment receipt")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentDetails(
            @PathVariable Long paymentId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        PaymentResponse response = paymentService.getPaymentDetails(paymentId, email);
        return ResponseEntity.ok(ApiResponse.success("Payment details retrieved successfully!", response));
    }

    @PostMapping("/refund")
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Issue a full gateway refund back to the customer's payment source (Admin only)")
    public ResponseEntity<ApiResponse<PaymentResponse>> refundPayment(
            @RequestParam Long paymentId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        PaymentResponse response = paymentService.refundPayment(paymentId, email);
        return ResponseEntity.ok(ApiResponse.success("Refund processed and order cancelled successfully!", response));
    }

    @GetMapping("/dashboard")
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get payment dashboard transaction summaries and metrics")
    public ResponseEntity<ApiResponse<PaymentDashboardResponse>> getPaymentDashboard() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        PaymentDashboardResponse response = paymentService.getPaymentDashboard(email);
        return ResponseEntity.ok(ApiResponse.success("Payment dashboard metrics retrieved successfully!", response));
    }

    @PostMapping("/webhook")
    @Operation(summary = "Razorpay Webhook listener endpoint for capture, failure, and refund events notification synchronizations")
    public ResponseEntity<Void> handleWebhook(
            @RequestBody String payload,
            @RequestHeader("X-Razorpay-Signature") String signatureHeader) {
        paymentService.handleWebhook(payload, signatureHeader);
        return ResponseEntity.ok().build();
    }
}
