package com.lastmiletracker.order.dto;

import com.lastmiletracker.ratecard.entity.CardType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CalculationRequest {

    @NotBlank(message = "Pickup pincode is required")
    private String pickupPincode;

    @NotBlank(message = "Delivery pincode is required")
    private String deliveryPincode;

    @NotNull(message = "Weight is required")
    @Positive(message = "Weight must be positive")
    private Double weight;

    @NotNull(message = "Length is required")
    @Positive(message = "Length must be positive")
    private Double length;

    @NotNull(message = "Breadth is required")
    @Positive(message = "Breadth must be positive")
    private Double breadth;

    @NotNull(message = "Height is required")
    @Positive(message = "Height must be positive")
    private Double height;

    private boolean isCod;
    private Double codAmount;
    private CardType cardType; // If null, B2C is default
}
