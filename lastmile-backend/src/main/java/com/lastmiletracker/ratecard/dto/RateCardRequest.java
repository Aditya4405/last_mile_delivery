package com.lastmiletracker.ratecard.dto;

import com.lastmiletracker.ratecard.entity.CardType;
import com.lastmiletracker.ratecard.entity.PricingType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RateCardRequest {

    @NotBlank(message = "Rate card name is required")
    private String name;

    @NotNull(message = "Card type (B2B or B2C) is required")
    private CardType cardType;

    @NotNull(message = "Pricing type (INTRA_ZONE or INTER_ZONE) is required")
    private PricingType pricingType;

    @NotNull(message = "Base weight is required")
    @Positive(message = "Base weight must be a positive number")
    private Double baseWeight;

    @NotNull(message = "Base rate is required")
    @Positive(message = "Base rate must be a positive number")
    private Double baseRate;

    @NotNull(message = "Additional weight unit is required")
    @Positive(message = "Additional weight unit must be a positive number")
    private Double additionalWeightUnit;

    @NotNull(message = "Additional rate is required")
    @Positive(message = "Additional rate must be a positive number")
    private Double additionalRate;

    @NotNull(message = "COD charge is required")
    @PositiveOrZero(message = "COD charge cannot be negative")
    private Double codCharge;

    private Long pickupZoneId;
    private Long deliveryZoneId;
}
