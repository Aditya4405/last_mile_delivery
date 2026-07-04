package com.lastmiletracker.area.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AreaResponse {

    private Long id;
    private String name;
    private String pincode;
    private Long zoneId;
    private String zoneName;
    private LocalDateTime createdAt;
}
