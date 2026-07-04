package com.lastmiletracker.agent.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AgentProfileResponse {

    private Long id;
    private String email;
    private String fullName;
    private String phone;
    private boolean available;
    private Double latitude;
    private Double longitude;
    private String vehicleType;
    private String licenseNumber;
    private boolean enabled;
}
