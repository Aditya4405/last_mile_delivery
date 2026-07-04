package com.lastmiletracker.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminDashboardStatsResponse {

    private long pendingOrders;
    private long completedOrders;
    private double totalRevenue;
    private double codCollections;
    private long failedDeliveries;
    private List<Map<String, Object>> topZones;
    private List<Map<String, Object>> topAgents;
    private List<Map<String, Object>> monthlySummary;
}
