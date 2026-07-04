package com.lastmiletracker.agent.mapper;

import com.lastmiletracker.agent.dto.AgentProfileResponse;
import com.lastmiletracker.agent.entity.DeliveryAgent;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AgentMapper {

    @Mapping(source = "user.email", target = "email")
    @Mapping(source = "user.fullName", target = "fullName")
    @Mapping(source = "user.phone", target = "phone")
    @Mapping(source = "user.enabled", target = "enabled")
    AgentProfileResponse toResponse(DeliveryAgent agent);
}
