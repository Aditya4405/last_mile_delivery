package com.lastmiletracker.zone.mapper;

import com.lastmiletracker.zone.dto.ZoneRequest;
import com.lastmiletracker.zone.dto.ZoneResponse;
import com.lastmiletracker.zone.entity.Zone;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface ZoneMapper {

    ZoneResponse toResponse(Zone zone);

    Zone toEntity(ZoneRequest request);

    void updateEntityFromRequest(ZoneRequest request, @MappingTarget Zone zone);
}
