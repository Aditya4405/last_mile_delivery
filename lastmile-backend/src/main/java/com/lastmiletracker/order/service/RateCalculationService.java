package com.lastmiletracker.order.service;

import com.lastmiletracker.order.dto.CalculationRequest;
import com.lastmiletracker.order.dto.CalculationResponse;
import com.lastmiletracker.ratecard.entity.CardType;
import com.lastmiletracker.ratecard.entity.PricingType;
import com.lastmiletracker.ratecard.entity.RateCard;
import com.lastmiletracker.ratecard.service.RateCardService;
import com.lastmiletracker.zone.dto.ZoneResponse;
import com.lastmiletracker.zone.service.ZoneService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Slf4j
public class RateCalculationService {

    private final ZoneService zoneService;
    private final RateCardService rateCardService;
    private final com.lastmiletracker.setting.service.SystemSettingService systemSettingService;

    public RateCalculationService(
            ZoneService zoneService,
            RateCardService rateCardService,
            com.lastmiletracker.setting.service.SystemSettingService systemSettingService) {
        this.zoneService = zoneService;
        this.rateCardService = rateCardService;
        this.systemSettingService = systemSettingService;
    }

    @Transactional(readOnly = true)
    public CalculationResponse calculate(CalculationRequest request) {
        // 1. Detect Pickup and Delivery Zones
        ZoneResponse pickupZone = zoneService.detectZone(request.getPickupPincode(), null, null);
        ZoneResponse deliveryZone = zoneService.detectZone(request.getDeliveryPincode(), null, null);

        // 2. Determine Pricing Type
        PricingType pricingType = pickupZone.getId().equals(deliveryZone.getId()) 
                ? PricingType.INTRA_ZONE 
                : PricingType.INTER_ZONE;

        // 3. Compute Volumetric Weight (L * B * H / 5000)
        double volumetricWeight = (request.getLength() * request.getBreadth() * request.getHeight()) / 5000.0;

        // 4. Compute Billable Weight (Max of actual weight and volumetric weight)
        double billableWeight = Math.max(request.getWeight(), volumetricWeight);

        // 5. Lookup matching Rate Card
        CardType cardType = request.getCardType() != null ? request.getCardType() : CardType.B2C;
        RateCard rateCard = rateCardService.getMatchingRateCard(cardType, pickupZone.getId(), deliveryZone.getId(), pricingType);

        // 6. Compute charges
        double baseRate = rateCard.getBaseRate();
        double additionalCost = 0.0;
        
        if (billableWeight > rateCard.getBaseWeight()) {
            double additionalWeight = billableWeight - rateCard.getBaseWeight();
            double units = Math.ceil(additionalWeight / rateCard.getAdditionalWeightUnit());
            additionalCost = units * rateCard.getAdditionalRate();
        }

        double codCharge = 0.0;
        if (request.isCod() && request.getCodAmount() != null && request.getCodAmount() > 0) {
            double defaultCodCharge = systemSettingService.getSettingAsDouble("DEFAULT_COD_CHARGE", 30.0);
            double rateCardCod = rateCard.getCodCharge() != null ? rateCard.getCodCharge() : 0.0;
            double codRate = rateCardCod > 0 ? rateCardCod : defaultCodCharge;
            codCharge = (codRate <= 1.0) 
                    ? (request.getCodAmount() * codRate) 
                    : codRate;
        }

        double totalCharge = baseRate + additionalCost + codCharge;

        String breakdown = String.format(
                "Rate Card: %s | Base Rate: %s INR (up to %s kg) | Additional Weight Cost: %s INR | COD Charge: %s INR | Billable Weight: %s kg (Actual: %s kg, Volumetric: %s kg)",
                rateCard.getName(), baseRate, rateCard.getBaseWeight(), additionalCost, codCharge, billableWeight, request.getWeight(), volumetricWeight
        );

        log.info("Rate calculation complete: Total={}", totalCharge);

        return CalculationResponse.builder()
                .pickupZoneName(pickupZone.getName())
                .deliveryZoneName(deliveryZone.getName())
                .pricingType(pricingType)
                .actualWeight(request.getWeight())
                .volumetricWeight(volumetricWeight)
                .billableWeight(billableWeight)
                .baseRate(baseRate)
                .additionalRate(additionalCost)
                .codCharge(codCharge)
                .totalShippingCharge(totalCharge)
                .rateCardName(rateCard.getName())
                .calculationDetails(breakdown)
                .build();
    }
}
