package com.lastmiletracker.agent.dto;

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
public class AgentDashboardResponse {

    private long assignedDeliveries;
    private long completedDeliveries;
    private long pendingDeliveries;
    private List<OrderResponse> recentAssignments;
}
