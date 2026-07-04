package com.lastmiletracker.order.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AgentAssignmentRequest {

    private Long agentId;
    private boolean autoAssign;
}
