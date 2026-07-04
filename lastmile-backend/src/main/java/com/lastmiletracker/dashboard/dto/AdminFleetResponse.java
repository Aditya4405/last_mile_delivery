package com.lastmiletracker.dashboard.dto;

import io.swagger.v3.oas.annotations.media.Schema;
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
public class AdminFleetResponse {

    @Schema(description = "Fleet agent tracking entries containing real-time status and live coordinates")
    private List<Map<String, Object>> activeAgents;
}
