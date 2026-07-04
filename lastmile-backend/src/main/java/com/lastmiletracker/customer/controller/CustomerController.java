package com.lastmiletracker.customer.controller;

import com.lastmiletracker.common.response.ApiResponse;
import com.lastmiletracker.customer.dto.CustomerProfileResponse;
import com.lastmiletracker.customer.dto.CustomerProfileUpdateRequest;
import com.lastmiletracker.customer.service.CustomerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.lastmiletracker.customer.dto.CustomerDashboardResponse;
import com.lastmiletracker.order.repository.OrderRepository;
import com.lastmiletracker.order.entity.Order;
import com.lastmiletracker.order.entity.OrderStatus;
import com.lastmiletracker.order.mapper.OrderMapper;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/customer")
@Tag(name = "Customer Controller", description = "Endpoints for managing customer profile details and dashboards")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('CUSTOMER')")
public class CustomerController {

    private final CustomerService customerService;
    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;

    public CustomerController(
            CustomerService customerService,
            OrderRepository orderRepository,
            OrderMapper orderMapper) {
        this.customerService = customerService;
        this.orderRepository = orderRepository;
        this.orderMapper = orderMapper;
    }

    @GetMapping("/profile")
    @Operation(summary = "Fetch current customer's profile")
    public ResponseEntity<ApiResponse<CustomerProfileResponse>> getProfile() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        CustomerProfileResponse response = customerService.getProfile(email);
        return ResponseEntity.ok(ApiResponse.success("Profile fetched successfully!", response));
    }

    @PutMapping("/profile")
    @Operation(summary = "Update current customer's profile")
    public ResponseEntity<ApiResponse<CustomerProfileResponse>> updateProfile(
            @Valid @RequestBody CustomerProfileUpdateRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        CustomerProfileResponse response = customerService.updateProfile(email, request);
        return ResponseEntity.ok(ApiResponse.success("Profile updated successfully!", response));
    }

    @DeleteMapping("/profile")
    @Operation(summary = "Delete current customer's account")
    public ResponseEntity<ApiResponse<Void>> deleteAccount() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        customerService.deleteAccount(email);
        return ResponseEntity.ok(ApiResponse.success("Account deleted successfully!"));
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get customer dashboard statistics")
    public ResponseEntity<ApiResponse<CustomerDashboardResponse>> getDashboardStats() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        
        List<Order> orders = orderRepository.findAll().stream()
                .filter(o -> o.getSender().getEmail().equals(email))
                .collect(Collectors.toList());

        long totalBookings = orders.size();
        
        long activeShipments = orders.stream()
                .filter(o -> o.getStatus() != OrderStatus.DELIVERED 
                        && o.getStatus() != OrderStatus.FAILED 
                        && o.getStatus() != OrderStatus.CANCELLED)
                .count();

        double totalSpent = orders.stream()
                .filter(o -> o.getStatus() == OrderStatus.DELIVERED)
                .mapToDouble(Order::getShippingCharge)
                .sum();

        List<com.lastmiletracker.order.dto.OrderResponse> recentOrders = orders.stream()
                .sorted((o1, o2) -> o2.getCreatedAt().compareTo(o1.getCreatedAt()))
                .limit(5)
                .map(orderMapper::toResponse)
                .collect(Collectors.toList());

        CustomerDashboardResponse response = CustomerDashboardResponse.builder()
                .totalBookings(totalBookings)
                .activeShipments(activeShipments)
                .totalSpent(totalSpent)
                .recentOrders(recentOrders)
                .build();

        return ResponseEntity.ok(ApiResponse.success("Customer dashboard statistics fetched successfully!", response));
    }
}
