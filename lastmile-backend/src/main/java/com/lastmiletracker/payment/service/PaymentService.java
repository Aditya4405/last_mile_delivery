package com.lastmiletracker.payment.service;

import com.lastmiletracker.exception.BadRequestException;
import com.lastmiletracker.exception.ForbiddenException;
import com.lastmiletracker.exception.ResourceNotFoundException;
import com.lastmiletracker.notification.service.NotificationService;
import com.lastmiletracker.order.entity.Order;
import com.lastmiletracker.order.entity.OrderStatus;
import com.lastmiletracker.order.repository.OrderRepository;
import com.lastmiletracker.order.service.OrderService;
import com.lastmiletracker.order.service.RateCalculationService;
import com.lastmiletracker.payment.dto.*;
import com.lastmiletracker.payment.entity.Payment;
import com.lastmiletracker.payment.entity.PaymentStatus;
import com.lastmiletracker.payment.mapper.PaymentMapper;
import com.lastmiletracker.payment.repository.PaymentRepository;
import com.lastmiletracker.user.entity.Role;
import com.lastmiletracker.user.entity.User;
import com.lastmiletracker.user.repository.UserRepository;
import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
@Slf4j
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final PaymentMapper paymentMapper;
    private final com.lastmiletracker.setting.service.SystemSettingService systemSettingService;
    private final OrderService orderService;
    private final RateCalculationService calculationService;

    @Value("${razorpay.key.id}")
    private String razorpayKeyId;

    @Value("${razorpay.key.secret}")
    private String razorpayKeySecret;

    public PaymentService(
            PaymentRepository paymentRepository,
            OrderRepository orderRepository,
            UserRepository userRepository,
            @Lazy NotificationService notificationService,
            PaymentMapper paymentMapper,
            com.lastmiletracker.setting.service.SystemSettingService systemSettingService,
            @Lazy OrderService orderService,
            RateCalculationService calculationService) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
        this.paymentMapper = paymentMapper;
        this.systemSettingService = systemSettingService;
        this.orderService = orderService;
        this.calculationService = calculationService;
    }

    /**
     * Create Razorpay Order
     */
    @Transactional
    public CreatePaymentOrderResponse createRazorpayOrder(CreatePaymentOrderRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        boolean razorpayEnabled = systemSettingService.getSettingAsBoolean("ENABLE_RAZORPAY", true);
        if (!razorpayEnabled) {
            throw new BadRequestException("Razorpay online payments gateway is currently disabled by administrator");
        }

        double shippingCharge;
        if (request.getOrderDetails() != null) {
            // New flow: Calculate price dynamically based on package details
            com.lastmiletracker.order.dto.OrderRequest orderReq = request.getOrderDetails();
            Double maxWeight = systemSettingService.getSettingAsDouble("MAX_PARCEL_WEIGHT", 50.0);
            Double minWeight = systemSettingService.getSettingAsDouble("MIN_PARCEL_WEIGHT", 0.1);
            if (orderReq.getWeight() > maxWeight) {
                throw new BadRequestException("Consignment weight exceeds maximum allowed parcel weight of " + maxWeight + " kg");
            }
            if (orderReq.getWeight() < minWeight) {
                throw new BadRequestException("Consignment weight is below minimum allowed parcel weight of " + minWeight + " kg");
            }

            com.lastmiletracker.order.dto.CalculationRequest calcRequest = com.lastmiletracker.order.dto.CalculationRequest.builder()
                    .pickupPincode(orderReq.getPickupPincode())
                    .deliveryPincode(orderReq.getDeliveryPincode())
                    .weight(orderReq.getWeight())
                    .length(orderReq.getLength())
                    .breadth(orderReq.getBreadth())
                    .height(orderReq.getHeight())
                    .isCod(false)
                    .cardType(orderReq.getCardType() != null ? orderReq.getCardType() : com.lastmiletracker.ratecard.entity.CardType.B2C)
                    .build();

            com.lastmiletracker.order.dto.CalculationResponse calcResponse = calculationService.calculate(calcRequest);
            shippingCharge = calcResponse.getTotalShippingCharge();
        } else {
            // Legacy flow fallback
            Order order = orderRepository.findById(request.getOrderId())
                    .orElseThrow(() -> new ResourceNotFoundException("Shipment order not found with ID: " + request.getOrderId()));
            if (user.getRole() != Role.ADMIN && !order.getSender().getId().equals(user.getId())) {
                throw new ForbiddenException("You do not have permission to pay for this shipment order");
            }
            shippingCharge = order.getShippingCharge();
        }

        try {
            RazorpayClient client = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            int amountPaise = (int) Math.round(shippingCharge * 100.0);
            JSONObject orderRequest = new JSONObject();
            orderRequest.put("amount", amountPaise);
            orderRequest.put("currency", "INR");
            orderRequest.put("receipt", "rcpt_" + System.currentTimeMillis());

            com.razorpay.Order rzpOrder = client.orders.create(orderRequest);
            String rzpOrderId = rzpOrder.get("id");

            if (request.getOrderDetails() == null && request.getOrderId() != null) {
                // Save legacy pre-persisted payment record
                Order order = orderRepository.findById(request.getOrderId()).orElseThrow();
                String invoicePrefix = systemSettingService.getSetting("INVOICE_PREFIX", "INV");
                String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
                String indexStr = String.format("%05d", (int) (Math.random() * 100000));
                String invoiceNumber = invoicePrefix + "-" + dateStr + "-" + indexStr;

                Payment payment = Payment.builder()
                        .paymentId("PAY-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                        .razorpayOrderId(rzpOrderId)
                        .order(order)
                        .customer(order.getSender())
                        .amount(order.getShippingCharge())
                        .currency("INR")
                        .status(PaymentStatus.CREATED)
                        .invoiceNumber(invoiceNumber)
                        .transactionReference("TXN-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase())
                        .remarks("Razorpay order initiated")
                        .build();

                paymentRepository.save(payment);
            }

            log.info("Razorpay Order created: {}", rzpOrderId);

            return CreatePaymentOrderResponse.builder()
                    .razorpayOrderId(rzpOrderId)
                    .amount((long) amountPaise)
                    .currency("INR")
                    .razorpayKey(razorpayKeyId)
                    .orderId(request.getOrderId())
                    .build();

        } catch (RazorpayException e) {
            log.error("Razorpay order creation failed", e);
            throw new BadRequestException("Failed to register Razorpay order: " + e.getMessage());
        }
    }

    /**
     * Verify payment signature and save order/payment details atomically
     */
    @Transactional
    public com.lastmiletracker.order.dto.OrderResponse verifyPaymentSignature(VerifyPaymentRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // 1. Verify HMAC Signature
        String payload = request.getRazorpayOrderId() + "|" + request.getRazorpayPaymentId();
        boolean isSignatureValid = false;
        try {
            String calculatedSig = calculateHMAC(payload, razorpayKeySecret);
            isSignatureValid = calculatedSig.equals(request.getRazorpaySignature());
        } catch (Exception e) {
            log.error("Error computing HMAC signature", e);
        }

        if (!isSignatureValid) {
            log.warn("Invalid payment signature for razorpayOrderId: {}", request.getRazorpayOrderId());
            throw new BadRequestException("Payment signature verification failed. Possible fraud attempt.");
        }

        Order order;
        com.lastmiletracker.order.dto.OrderResponse orderRes;

        if (request.getOrderDetails() != null) {
            // New flow: Save the Order now that payment is confirmed
            orderRes = orderService.createOrder(request.getOrderDetails(), userEmail);
            order = orderRepository.findById(orderRes.getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Order could not be retrieved after creation"));
        } else {
            // Legacy flow
            order = orderRepository.findById(request.getOrderId())
                    .orElseThrow(() -> new ResourceNotFoundException("Shipment order not found with ID: " + request.getOrderId()));
            orderRes = orderService.getOrderById(order.getId(), user);
        }

        // Generate Invoice Number
        String invoicePrefix = systemSettingService.getSetting("INVOICE_PREFIX", "INV");
        String dateStr = LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMMdd"));
        String indexStr = String.format("%05d", (int) (Math.random() * 100000));
        String invoiceNumber = invoicePrefix + "-" + dateStr + "-" + indexStr;

        // Generate unique system payment reference
        String paymentIdVal = "PAY-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Payment payment = Payment.builder()
                .paymentId(paymentIdVal)
                .razorpayOrderId(request.getRazorpayOrderId())
                .razorpayPaymentId(request.getRazorpayPaymentId())
                .razorpaySignature(request.getRazorpaySignature())
                .order(order)
                .customer(order.getSender())
                .amount(order.getShippingCharge())
                .currency("INR")
                .status(PaymentStatus.CAPTURED)
                .paymentMethod("ONLINE")
                .invoiceNumber(invoiceNumber)
                .transactionReference("TXN-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase())
                .remarks("Razorpay signature verified successfully")
                .build();

        paymentRepository.save(payment);

        // 3. Update order state to CONFIRMED
        order.setStatus(OrderStatus.CONFIRMED);
        orderRepository.save(order);

        // Update response model status
        orderRes.setStatus(OrderStatus.CONFIRMED);

        // 4. Create and dispatch notification
        notificationService.sendNotification(
                order.getSender(),
                "Payment Successful",
                "Your payment of INR " + payment.getAmount() + " for tracking ID: " + order.getTrackingNumber() + " was captured successfully. Invoice: " + payment.getInvoiceNumber()
        );

        log.info("Payment verified successfully: {} for Order ID: {}", payment.getPaymentId(), order.getId());
        return orderRes;
    }

    /**
     * Get Customer payment history
     */
    public List<PaymentResponse> getPaymentHistory(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Payment> payments;
        if (user.getRole() == Role.ADMIN) {
            payments = paymentRepository.findAllByOrderByCreatedAtDesc();
        } else {
            payments = paymentRepository.findByCustomerIdOrderByCreatedAtDesc(user.getId());
        }

        return payments.stream()
                .map(paymentMapper::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Get Payment Details
     */
    public PaymentResponse getPaymentDetails(Long id, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found with ID: " + id));

        if (user.getRole() != Role.ADMIN && !payment.getCustomer().getId().equals(user.getId())) {
            throw new ForbiddenException("You do not have access to this payment receipt");
        }

        return paymentMapper.toResponse(payment);
    }

    /**
     * Admin only Refund Payment
     */
    @Transactional
    public PaymentResponse refundPayment(Long paymentId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() != Role.ADMIN) {
            throw new ForbiddenException("Only administrators can process payment refunds");
        }

        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment record not found with ID: " + paymentId));

        if (payment.getStatus() != PaymentStatus.CAPTURED) {
            throw new BadRequestException("Only successfully captured payments can be refunded");
        }

        try {
            RazorpayClient client = new RazorpayClient(razorpayKeyId, razorpayKeySecret);

            JSONObject refundRequest = new JSONObject();
            refundRequest.put("payment_id", payment.getRazorpayPaymentId());
            refundRequest.put("amount", (int) Math.round(payment.getAmount() * 100.0));

            com.razorpay.Refund rzpRefund = client.payments.refund(refundRequest);
            String refundId = rzpRefund.get("id");

            payment.setStatus(PaymentStatus.REFUNDED);
            payment.setRemarks("Refund processed successfully. Razorpay Refund ID: " + refundId);
            paymentRepository.save(payment);

            // Update linked order status to CANCELLED
            Order order = payment.getOrder();
            order.setStatus(OrderStatus.CANCELLED);
            orderRepository.save(order);

            // Notify Customer
            notificationService.sendNotification(
                    payment.getCustomer(),
                    "Refund Processed",
                    "A refund of INR " + payment.getAmount() + " has been credited back for tracking ID: " + order.getTrackingNumber()
            );

            log.info("Payment refunded successfully: {} for Refund ID: {}", payment.getPaymentId(), refundId);
            return paymentMapper.toResponse(payment);

        } catch (RazorpayException e) {
            log.error("Razorpay refund process failed", e);
            throw new BadRequestException("Failed to request Razorpay refund: " + e.getMessage());
        }
    }

    /**
     * Payment Analytics Dashboard Summary
     */
    public PaymentDashboardResponse getPaymentDashboard(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        List<Payment> payments;
        List<Order> orders;

        if (user.getRole() == Role.ADMIN) {
            payments = paymentRepository.findAll();
            orders = orderRepository.findAll();
        } else {
            payments = paymentRepository.findByCustomerIdOrderByCreatedAtDesc(user.getId());
            orders = orderRepository.findAll().stream()
                    .filter(o -> o.getSender().getId().equals(user.getId()))
                    .collect(Collectors.toList());
        }

        double totalPaid = payments.stream()
                .filter(p -> p.getStatus() == PaymentStatus.CAPTURED)
                .mapToDouble(Payment::getAmount)
                .sum();

        double pendingCod = orders.stream()
                .filter(Order::isCod)
                .filter(o -> o.getStatus() == OrderStatus.OUT_FOR_DELIVERY || o.getStatus() == OrderStatus.IN_TRANSIT)
                .mapToDouble(Order::getShippingCharge)
                .sum();

        long onlineCount = payments.stream()
                .filter(p -> p.getStatus() == PaymentStatus.CAPTURED)
                .count();

        long failedCount = payments.stream()
                .filter(p -> p.getStatus() == PaymentStatus.FAILED)
                .count();

        long refundsCount = payments.stream()
                .filter(p -> p.getStatus() == PaymentStatus.REFUNDED)
                .count();

        List<PaymentResponse> recent = payments.stream()
                .limit(user.getRole() == Role.ADMIN ? 10 : 5)
                .map(paymentMapper::toResponse)
                .collect(Collectors.toList());

        return PaymentDashboardResponse.builder()
                .totalPaid(totalPaid)
                .pendingCod(pendingCod)
                .onlinePaymentsCount(onlineCount)
                .failedPaymentsCount(failedCount)
                .refundsCount(refundsCount)
                .recentPayments(recent)
                .build();
    }

    /**
     * Webhook Handler for automated state sync
     */
    @Transactional
    public void handleWebhook(String payload, String signatureHeader) {
        // Validate signature
        boolean isSignatureValid = false;
        try {
            isSignatureValid = com.razorpay.Utils.verifyWebhookSignature(payload, signatureHeader, razorpayKeySecret);
        } catch (Exception e) {
            log.error("Error verifying webhook signature", e);
        }

        if (!isSignatureValid) {
            log.warn("Invalid webhook signature received");
            throw new BadRequestException("Webhook signature verification failed");
        }

        JSONObject json = new JSONObject(payload);
        String event = json.getString("event");
        JSONObject eventData = json.getJSONObject("payload");

        log.info("Processing Razorpay Webhook Event: {}", event);

        if ("payment.captured".equals(event)) {
            JSONObject paymentObj = eventData.getJSONObject("payment").getJSONObject("entity");
            String rzpOrderId = paymentObj.getString("order_id");
            String rzpPaymentId = paymentObj.getString("id");

            paymentRepository.findByRazorpayOrderId(rzpOrderId).ifPresent(payment -> {
                if (payment.getStatus() != PaymentStatus.CAPTURED) {
                    payment.setRazorpayPaymentId(rzpPaymentId);
                    payment.setStatus(PaymentStatus.CAPTURED);
                    payment.setPaymentMethod(paymentObj.optString("method", "ONLINE"));
                    paymentRepository.save(payment);

                    Order order = payment.getOrder();
                    order.setStatus(OrderStatus.CONFIRMED);
                    orderRepository.save(order);

                    notificationService.sendNotification(
                            order.getSender(),
                            "Payment Successful (Webhook)",
                            "Payment of INR " + payment.getAmount() + " captured successfully. Invoice: " + payment.getInvoiceNumber()
                    );
                }
            });

        } else if ("payment.failed".equals(event)) {
            JSONObject paymentObj = eventData.getJSONObject("payment").getJSONObject("entity");
            String rzpOrderId = paymentObj.getString("order_id");

            paymentRepository.findByRazorpayOrderId(rzpOrderId).ifPresent(payment -> {
                payment.setStatus(PaymentStatus.FAILED);
                payment.setRemarks("Payment failed. Webhook event trigger.");
                paymentRepository.save(payment);
            });

        } else if ("refund.processed".equals(event)) {
            JSONObject refundObj = eventData.getJSONObject("refund").getJSONObject("entity");
            String rzpPaymentId = refundObj.getString("payment_id");

            // Look up payment by payment_id
            paymentRepository.findAll().stream()
                    .filter(p -> rzpPaymentId.equals(p.getRazorpayPaymentId()))
                    .findFirst()
                    .ifPresent(payment -> {
                        payment.setStatus(PaymentStatus.REFUNDED);
                        paymentRepository.save(payment);

                        Order order = payment.getOrder();
                        order.setStatus(OrderStatus.CANCELLED);
                        orderRepository.save(order);
                    });
        }
    }

    /**
     * Compute HMAC-SHA256 signature manually
     */
    private String calculateHMAC(String data, String key) throws Exception {
        Mac sha256HMAC = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        sha256HMAC.init(secretKey);
        byte[] hash = sha256HMAC.doFinal(data.getBytes(StandardCharsets.UTF_8));
        
        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) hexString.append('0');
            hexString.append(hex);
        }
        return hexString.toString();
    }
}
