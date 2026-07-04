package com.lastmiletracker.tracking.mapper;

import com.lastmiletracker.order.entity.Order;
import com.lastmiletracker.tracking.dto.TrackingResponse;
import com.lastmiletracker.tracking.entity.TrackingHistory;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface TrackingMapper {

    @Mapping(source = "order.trackingNumber", target = "trackingNumber")
    @Mapping(source = "order.status", target = "status")
    @Mapping(source = "order.pickupAddress", target = "pickupAddress")
    @Mapping(source = "order.deliveryAddress", target = "deliveryAddress")
    @Mapping(source = "order.recipientName", target = "recipientName")
    @Mapping(source = "historySteps", target = "timeline")
    TrackingResponse toResponse(Order order, List<TrackingHistory> historySteps);

    TrackingResponse.TimelineStep toTimelineStep(TrackingHistory history);
}
