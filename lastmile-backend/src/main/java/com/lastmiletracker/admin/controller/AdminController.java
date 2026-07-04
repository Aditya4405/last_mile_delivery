package com.lastmiletracker.admin.controller;

import com.lastmiletracker.admin.dto.AdminDashboardStatsResponse;
import com.lastmiletracker.agent.dto.AgentProfileResponse;
import com.lastmiletracker.agent.dto.AgentProfileUpdateRequest;
import com.lastmiletracker.agent.entity.DeliveryAgent;
import com.lastmiletracker.agent.mapper.AgentMapper;
import com.lastmiletracker.agent.repository.DeliveryAgentRepository;
import com.lastmiletracker.common.response.ApiResponse;
import com.lastmiletracker.customer.dto.CustomerProfileResponse;
import com.lastmiletracker.customer.entity.Customer;
import com.lastmiletracker.customer.mapper.CustomerMapper;
import com.lastmiletracker.customer.repository.CustomerRepository;
import com.lastmiletracker.exception.ResourceNotFoundException;
import com.lastmiletracker.user.entity.User;
import com.lastmiletracker.user.repository.UserRepository;
import com.lastmiletracker.order.entity.Order;
import com.lastmiletracker.order.entity.OrderStatus;
import com.lastmiletracker.order.repository.OrderRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Admin Controller", description = "Endpoints for administrators to manage users, configure systems, and view reports")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final DeliveryAgentRepository agentRepository;
    private final CustomerMapper customerMapper;
    private final AgentMapper agentMapper;
    private final OrderRepository orderRepository;

    public AdminController(
            UserRepository userRepository,
            CustomerRepository customerRepository,
            DeliveryAgentRepository agentRepository,
            CustomerMapper customerMapper,
            AgentMapper agentMapper,
            OrderRepository orderRepository) {
        this.userRepository = userRepository;
        this.customerRepository = customerRepository;
        this.agentRepository = agentRepository;
        this.customerMapper = customerMapper;
        this.agentMapper = agentMapper;
        this.orderRepository = orderRepository;
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get admin dashboard statistics and monthly summaries")
    public ResponseEntity<ApiResponse<AdminDashboardStatsResponse>> getDashboardStats() {
        List<Order> orders = orderRepository.findAll();

        long pendingOrders = orders.stream()
                .filter(o -> o.getStatus() != OrderStatus.DELIVERED 
                        && o.getStatus() != OrderStatus.FAILED 
                        && o.getStatus() != OrderStatus.CANCELLED)
                .count();

        long completedOrders = orders.stream()
                .filter(o -> o.getStatus() == OrderStatus.DELIVERED)
                .count();

        double totalRevenue = orders.stream()
                .filter(o -> o.getStatus() == OrderStatus.DELIVERED)
                .mapToDouble(Order::getShippingCharge)
                .sum();

        double codCollections = orders.stream()
                .filter(o -> o.getStatus() == OrderStatus.DELIVERED && o.isCod())
                .mapToDouble(o -> o.getCodAmount() != null ? o.getCodAmount() : 0.0)
                .sum();

        long failedDeliveries = orders.stream()
                .filter(o -> o.getStatus() == OrderStatus.FAILED)
                .count();

        // Aggregate Top Zones
        Map<String, Long> zoneCounts = orders.stream()
                .filter(o -> o.getDeliveryZone() != null)
                .collect(Collectors.groupingBy(o -> o.getDeliveryZone().getName(), Collectors.counting()));

        List<Map<String, Object>> topZones = zoneCounts.entrySet().stream()
                .map(entry -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("zone", entry.getKey());
                    map.put("deliveries", entry.getValue());
                    map.put("revenue", entry.getValue() * 150.0); // Average shipping estimate
                    return map;
                })
                .collect(Collectors.toList());

        // Aggregate Top Agents
        Map<String, Long> agentCounts = orders.stream()
                .filter(o -> o.getAssignedAgent() != null && o.getStatus() == OrderStatus.DELIVERED)
                .collect(Collectors.groupingBy(o -> o.getAssignedAgent().getUser().getFullName(), Collectors.counting()));

        List<Map<String, Object>> topAgents = agentCounts.entrySet().stream()
                .map(entry -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("agentName", entry.getKey());
                    map.put("deliveriesCompleted", entry.getValue());
                    map.put("rating", 4.8); // Default fallback rating
                    return map;
                })
                .collect(Collectors.toList());

        List<Map<String, Object>> monthlySummary = new ArrayList<>();
        monthlySummary.add(Map.of("month", "June", "completed", completedOrders, "revenue", totalRevenue));

        AdminDashboardStatsResponse response = AdminDashboardStatsResponse.builder()
                .pendingOrders(pendingOrders)
                .completedOrders(completedOrders)
                .totalRevenue(totalRevenue)
                .codCollections(codCollections)
                .failedDeliveries(failedDeliveries)
                .topZones(topZones)
                .topAgents(topAgents)
                .monthlySummary(monthlySummary)
                .build();

        return ResponseEntity.ok(ApiResponse.success("Dashboard metrics fetched successfully!", response));
    }

    @GetMapping("/reports")
    @Operation(summary = "Generate and export monthly logistics report summary")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getReports() {
        List<Order> orders = orderRepository.findAll();

        Map<String, List<Order>> groupedByDate = orders.stream()
                .collect(Collectors.groupingBy(o -> o.getCreatedAt().toLocalDate().toString()));

        List<Map<String, Object>> report = new ArrayList<>();
        for (Map.Entry<String, List<Order>> entry : groupedByDate.entrySet()) {
            List<Order> dayOrders = entry.getValue();
            long total = dayOrders.size();
            long delivered = dayOrders.stream().filter(o -> o.getStatus() == OrderStatus.DELIVERED).count();
            long failed = dayOrders.stream().filter(o -> o.getStatus() == OrderStatus.FAILED).count();
            double revenue = dayOrders.stream().filter(o -> o.getStatus() == OrderStatus.DELIVERED).mapToDouble(Order::getShippingCharge).sum();

            Map<String, Object> stats = new HashMap<>();
            stats.put("date", entry.getKey());
            stats.put("totalOrders", total);
            stats.put("delivered", delivered);
            stats.put("failed", failed);
            stats.put("revenue", revenue);
            report.add(stats);
        }

        return ResponseEntity.ok(ApiResponse.success("Report data exported successfully!", report));
    }

    @GetMapping("/customers")
    @Operation(summary = "List all registered customers")
    public ResponseEntity<ApiResponse<List<CustomerProfileResponse>>> getAllCustomers() {
        List<CustomerProfileResponse> response = customerRepository.findAll().stream()
                .map(customerMapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("All customers fetched successfully!", response));
    }

    @DeleteMapping("/customers/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete customer profile and login credentials")
    public ResponseEntity<ApiResponse<Void>> deleteCustomer(@PathVariable Long id) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer profile not found"));
        userRepository.delete(customer.getUser());
        return ResponseEntity.ok(ApiResponse.success("Customer profile deleted successfully!"));
    }

    @GetMapping("/agents")
    @Operation(summary = "List all delivery agents")
    public ResponseEntity<ApiResponse<List<AgentProfileResponse>>> getAllAgents() {
        List<AgentProfileResponse> response = agentRepository.findAll().stream()
                .map(agentMapper::toResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success("All delivery agents fetched successfully!", response));
    }

    @PutMapping("/agents/{id}")
    @Operation(summary = "Update delivery agent details (Admin override)")
    public ResponseEntity<ApiResponse<AgentProfileResponse>> updateAgent(
            @PathVariable Long id,
            @Valid @RequestBody AgentProfileUpdateRequest request) {
        DeliveryAgent agent = agentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery agent profile not found"));

        User user = agent.getUser();
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());

        agent.setVehicleType(request.getVehicleType());
        agent.setLicenseNumber(request.getLicenseNumber());

        userRepository.save(user);
        DeliveryAgent savedAgent = agentRepository.save(agent);

        return ResponseEntity.ok(ApiResponse.success("Agent profile updated successfully!", agentMapper.toResponse(savedAgent)));
    }

    @DeleteMapping("/agents/{id}")
    @Operation(summary = "Delete agent profile and login credentials")
    public ResponseEntity<ApiResponse<Void>> deleteAgent(@PathVariable Long id) {
        DeliveryAgent agent = agentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Delivery agent profile not found"));
        userRepository.delete(agent.getUser());
        return ResponseEntity.ok(ApiResponse.success("Delivery agent profile deleted successfully!"));
    }
}
