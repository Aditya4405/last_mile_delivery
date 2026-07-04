package com.lastmiletracker.ratecard.repository;

import com.lastmiletracker.ratecard.entity.CardType;
import com.lastmiletracker.ratecard.entity.PricingType;
import com.lastmiletracker.ratecard.entity.RateCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RateCardRepository extends JpaRepository<RateCard, Long> {

    List<RateCard> findByCardType(CardType cardType);

    List<RateCard> findByCardTypeAndPricingType(CardType cardType, PricingType pricingType);

    Optional<RateCard> findFirstByCardTypeAndPickupZoneIdAndDeliveryZoneIdAndPricingType(
            CardType cardType, Long pickupZoneId, Long deliveryZoneId, PricingType pricingType);
}
