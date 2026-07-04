package com.lastmiletracker.tracking.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrackingMessage {

    private Long orderId;
    private String trackingNumber;
    private Double latitude;
    private Double longitude;
    private Double speed;
    private String eta;
    private String status;
    private String timestamp;
}
