package com.lastmiletracker.tracking.dto;

import com.lastmiletracker.order.entity.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrackingResponse {

    private String trackingNumber;
    private OrderStatus status;
    private String pickupAddress;
    private String deliveryAddress;
    private String recipientName;
    private List<TimelineStep> timeline;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class TimelineStep {
        private OrderStatus status;
        private String location;
        private String remarks;
        private LocalDateTime updatedAt;
    }
}
