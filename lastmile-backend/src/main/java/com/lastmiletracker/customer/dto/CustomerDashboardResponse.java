package com.lastmiletracker.customer.dto;

import com.lastmiletracker.order.dto.OrderResponse;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CustomerDashboardResponse {

    private long totalBookings;
    private long activeShipments;
    private double totalSpent;
    private List<OrderResponse> recentOrders;
}
