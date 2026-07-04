package com.lastmiletracker.ratecard.mapper;

import com.lastmiletracker.ratecard.dto.RateCardRequest;
import com.lastmiletracker.ratecard.dto.RateCardResponse;
import com.lastmiletracker.ratecard.entity.RateCard;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface RateCardMapper {

    @Mapping(source = "pickupZone.id", target = "pickupZoneId")
    @Mapping(source = "pickupZone.name", target = "pickupZoneName")
    @Mapping(source = "deliveryZone.id", target = "deliveryZoneId")
    @Mapping(source = "deliveryZone.name", target = "deliveryZoneName")
    RateCardResponse toResponse(RateCard rateCard);

    @Mapping(target = "pickupZone", ignore = true)
    @Mapping(target = "deliveryZone", ignore = true)
    RateCard toEntity(RateCardRequest request);
}
