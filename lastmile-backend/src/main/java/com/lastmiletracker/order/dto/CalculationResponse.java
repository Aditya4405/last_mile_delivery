package com.lastmiletracker.order.dto;

import com.lastmiletracker.ratecard.entity.PricingType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CalculationResponse {

    private String pickupZoneName;
    private String deliveryZoneName;
    private PricingType pricingType;
    private Double actualWeight;
    private Double volumetricWeight;
    private Double billableWeight;
    private Double baseRate;
    private Double additionalRate;
    private Double codCharge;
    private Double totalShippingCharge;
    private String rateCardName;
    private String calculationDetails;
}
