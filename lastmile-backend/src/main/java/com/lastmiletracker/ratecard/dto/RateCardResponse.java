package com.lastmiletracker.ratecard.dto;

import com.lastmiletracker.ratecard.entity.CardType;
import com.lastmiletracker.ratecard.entity.PricingType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RateCardResponse {

    private Long id;
    private String name;
    private CardType cardType;
    private PricingType pricingType;
    private Double baseWeight;
    private Double baseRate;
    private Double additionalWeightUnit;
    private Double additionalRate;
    private Double codCharge;
    private Long pickupZoneId;
    private String pickupZoneName;
    private Long deliveryZoneId;
    private String deliveryZoneName;
    private LocalDateTime createdAt;
}
