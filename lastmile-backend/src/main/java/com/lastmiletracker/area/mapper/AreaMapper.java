package com.lastmiletracker.area.mapper;

import com.lastmiletracker.area.dto.AreaResponse;
import com.lastmiletracker.area.entity.Area;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AreaMapper {

    @Mapping(source = "zone.id", target = "zoneId")
    @Mapping(source = "zone.name", target = "zoneName")
    AreaResponse toResponse(Area area);
}
