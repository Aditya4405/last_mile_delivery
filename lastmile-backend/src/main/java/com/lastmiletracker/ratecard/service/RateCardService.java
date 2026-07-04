package com.lastmiletracker.ratecard.service;

import com.lastmiletracker.exception.ResourceNotFoundException;
import com.lastmiletracker.ratecard.dto.RateCardRequest;
import com.lastmiletracker.ratecard.dto.RateCardResponse;
import com.lastmiletracker.ratecard.entity.CardType;
import com.lastmiletracker.ratecard.entity.PricingType;
import com.lastmiletracker.ratecard.entity.RateCard;
import com.lastmiletracker.ratecard.mapper.RateCardMapper;
import com.lastmiletracker.ratecard.repository.RateCardRepository;
import com.lastmiletracker.zone.entity.Zone;
import com.lastmiletracker.zone.repository.ZoneRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
public class RateCardService {

    private final RateCardRepository rateCardRepository;
    private final ZoneRepository zoneRepository;
    private final RateCardMapper rateCardMapper;

    public RateCardService(
            RateCardRepository rateCardRepository,
            ZoneRepository zoneRepository,
            RateCardMapper rateCardMapper) {
        this.rateCardRepository = rateCardRepository;
        this.zoneRepository = zoneRepository;
        this.rateCardMapper = rateCardMapper;
    }

    @Transactional(readOnly = true)
    public List<RateCardResponse> getAllRateCards() {
        return rateCardRepository.findAll().stream()
                .map(rateCardMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RateCardResponse getRateCardById(Long id) {
        RateCard rateCard = rateCardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rate card not found with id: " + id));
        return rateCardMapper.toResponse(rateCard);
    }

    @Transactional
    public RateCardResponse createRateCard(RateCardRequest request) {
        RateCard rateCard = rateCardMapper.toEntity(request);

        if (request.getPickupZoneId() != null) {
            Zone pickup = zoneRepository.findById(request.getPickupZoneId())
                    .orElseThrow(() -> new ResourceNotFoundException("Pickup zone not found"));
            rateCard.setPickupZone(pickup);
        }

        if (request.getDeliveryZoneId() != null) {
            Zone delivery = zoneRepository.findById(request.getDeliveryZoneId())
                    .orElseThrow(() -> new ResourceNotFoundException("Delivery zone not found"));
            rateCard.setDeliveryZone(delivery);
        }

        RateCard saved = rateCardRepository.save(rateCard);
        log.info("New rate card created: {}", saved.getName());
        return rateCardMapper.toResponse(saved);
    }

    @Transactional
    public RateCardResponse updateRateCard(Long id, RateCardRequest request) {
        RateCard rateCard = rateCardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rate card not found with id: " + id));

        rateCard.setName(request.getName());
        rateCard.setCardType(request.getCardType());
        rateCard.setPricingType(request.getPricingType());
        rateCard.setBaseWeight(request.getBaseWeight());
        rateCard.setBaseRate(request.getBaseRate());
        rateCard.setAdditionalWeightUnit(request.getAdditionalWeightUnit());
        rateCard.setAdditionalRate(request.getAdditionalRate());
        rateCard.setCodCharge(request.getCodCharge());

        if (request.getPickupZoneId() != null) {
            Zone pickup = zoneRepository.findById(request.getPickupZoneId())
                    .orElseThrow(() -> new ResourceNotFoundException("Pickup zone not found"));
            rateCard.setPickupZone(pickup);
        } else {
            rateCard.setPickupZone(null);
        }

        if (request.getDeliveryZoneId() != null) {
            Zone delivery = zoneRepository.findById(request.getDeliveryZoneId())
                    .orElseThrow(() -> new ResourceNotFoundException("Delivery zone not found"));
            rateCard.setDeliveryZone(delivery);
        } else {
            rateCard.setDeliveryZone(null);
        }

        RateCard updated = rateCardRepository.save(rateCard);
        log.info("Rate card updated: {}", updated.getName());
        return rateCardMapper.toResponse(updated);
    }

    @Transactional
    public void deleteRateCard(Long id) {
        RateCard rateCard = rateCardRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rate card not found with id: " + id));
        rateCardRepository.delete(rateCard);
        log.info("Rate card deleted: {}", rateCard.getName());
    }

    @Transactional(readOnly = true)
    public RateCard getMatchingRateCard(CardType cardType, Long pickupZoneId, Long deliveryZoneId, PricingType pricingType) {
        // 1. Match specific zone routing
        Optional<RateCard> rateCardOpt = rateCardRepository
                .findFirstByCardTypeAndPickupZoneIdAndDeliveryZoneIdAndPricingType(cardType, pickupZoneId, deliveryZoneId, pricingType);

        if (rateCardOpt.isPresent()) {
            return rateCardOpt.get();
        }

        // 2. Match pricing type generally (e.g. any intra-zone or inter-zone rate card fallback)
        List<RateCard> fallbacks = rateCardRepository.findByCardTypeAndPricingType(cardType, pricingType);
        if (!fallbacks.isEmpty()) {
            log.warn("Specific rate card path (pickup: {}, delivery: {}) not found. Defaulting to general card: {}", pickupZoneId, deliveryZoneId, fallbacks.get(0).getName());
            return fallbacks.get(0);
        }

        // 3. Match any card type generally
        List<RateCard> defaultCards = rateCardRepository.findByCardType(cardType);
        if (!defaultCards.isEmpty()) {
            return defaultCards.get(0);
        }

        throw new ResourceNotFoundException("No valid rate cards found matching parameters: CardType=" + cardType + ", PricingType=" + pricingType);
    }
}
