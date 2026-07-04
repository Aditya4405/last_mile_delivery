package com.lastmiletracker.order.controller;

import com.lastmiletracker.common.response.ApiResponse;
import com.lastmiletracker.exception.ResourceNotFoundException;
import com.lastmiletracker.order.dto.*;
import com.lastmiletracker.order.entity.OrderStatus;
import com.lastmiletracker.order.service.OrderService;
import com.lastmiletracker.order.service.RateCalculationService;
import com.lastmiletracker.user.entity.User;
import com.lastmiletracker.user.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@Slf4j
@RequestMapping("/api/orders")
@Tag(name = "Order Controller", description = "Endpoints for placing orders, calculating shipping charges, manual/auto-agent assignment, and status tracking")
@SecurityRequirement(name = "bearerAuth")
public class OrderController {

    private final OrderService orderService;
    private final RateCalculationService calculationService;
    private final UserRepository userRepository;

    public OrderController(
            OrderService orderService,
            RateCalculationService calculationService,
            UserRepository userRepository) {
        this.orderService = orderService;
        this.calculationService = calculationService;
        this.userRepository = userRepository;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Place a new delivery order (Customer or Admin)")
    public ResponseEntity<ApiResponse<OrderResponse>> createOrder(@Valid @RequestBody OrderRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        OrderResponse response = orderService.createOrder(request, email);
        return new ResponseEntity<>(ApiResponse.success("Order placed successfully!", response), HttpStatus.CREATED);
    }

    @PostMapping("/calculate")
    @Operation(summary = "Calculate volumetric weight and shipping charges without placing an order")
    public ResponseEntity<ApiResponse<CalculationResponse>> calculateCharges(
            @Valid @RequestBody CalculationRequest request) {
        CalculationResponse response = calculationService.calculate(request);
        return ResponseEntity.ok(ApiResponse.success("Charges calculated successfully!", response));
    }

    @GetMapping
    @Operation(summary = "List and search orders with filtering (Paginated, Sorted)")
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getAllOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction,
            @RequestParam(required = false) OrderStatus status,
            @RequestParam(required = false) String search) {

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<OrderResponse> response = orderService.getAllOrders(pageable, status, search, email, user.getRole());
        return ResponseEntity.ok(ApiResponse.success("Orders fetched successfully!", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order details by unique database ID")
    public ResponseEntity<ApiResponse<OrderResponse>> getOrderById(@PathVariable Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        OrderResponse response = orderService.getOrderById(id, user);
        return ResponseEntity.ok(ApiResponse.success("Order details fetched successfully!", response));
    }

    @PostMapping("/assign-agent")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Assign a delivery agent to an order manually or automatically (Admin only)")
    public ResponseEntity<ApiResponse<OrderResponse>> assignAgent(
            @RequestParam Long orderId,
            @RequestBody AgentAssignmentRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User admin = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Admin user not found"));

        OrderResponse response = orderService.assignAgent(orderId, request, admin);
        return ResponseEntity.ok(ApiResponse.success("Delivery agent assigned successfully!", response));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'DELIVERY_AGENT')")
    @Operation(summary = "Update/Override order delivery status (Admin or Assigned Agent)")
    public ResponseEntity<ApiResponse<OrderResponse>> updateStatus(
            @PathVariable Long id,
            @RequestParam OrderStatus status,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String remarks) {

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        OrderResponse response = orderService.updateOrderStatus(id, status, location, remarks, user);
        return ResponseEntity.ok(ApiResponse.success("Order status updated successfully!", response));
    }

    @PostMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'ADMIN')")
    @Operation(summary = "Cancel an order before dispatch")
    public ResponseEntity<ApiResponse<OrderResponse>> cancelOrder(@PathVariable Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        OrderResponse response = orderService.cancelOrder(id, user);
        return ResponseEntity.ok(ApiResponse.success("Order cancelled successfully!", response));
    }
}
