package com.lastmiletracker.order.mapper;

import com.lastmiletracker.order.dto.OrderResponse;
import com.lastmiletracker.order.entity.Order;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.NullValueCheckStrategy;
import org.mapstruct.ReportingPolicy;

@Mapper(
        componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.IGNORE,
        nullValueCheckStrategy = NullValueCheckStrategy.ALWAYS
)
public interface OrderMapper {

    @Mapping(source = "sender.id", target = "senderId")
    @Mapping(source = "sender.fullName", target = "senderName")
    @Mapping(source = "sender.email", target = "senderEmail")
    @Mapping(source = "sender.phone", target = "senderPhone")

    @Mapping(source = "pickupZone.id", target = "pickupZoneId")
    @Mapping(source = "pickupZone.name", target = "pickupZoneName")

    @Mapping(source = "deliveryZone.id", target = "deliveryZoneId")
    @Mapping(source = "deliveryZone.name", target = "deliveryZoneName")

    @Mapping(source = "assignedAgent.id", target = "assignedAgentId")
    @Mapping(source = "assignedAgent.user.fullName", target = "assignedAgentName")
    @Mapping(source = "assignedAgent.user.phone", target = "assignedAgentPhone")
    @Mapping(source = "assignedAgent.vehicleType", target = "vehicleType")
    @Mapping(source = "assignedAgent.latitude", target = "agentLatitude")
    @Mapping(source = "assignedAgent.longitude", target = "agentLongitude")
    OrderResponse toResponse(Order order);
}