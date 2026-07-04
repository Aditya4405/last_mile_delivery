package com.lastmiletracker.order.dto;

import com.lastmiletracker.ratecard.entity.CardType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderRequest {

    @Schema(description = "Full name of the recipient", example = "Rahul Sharma")
    @NotBlank(message = "Recipient name is required")
    @Size(min = 3, max = 100, message = "Recipient name must be between 3 and 100 characters")
    private String recipientName;

    @Schema(description = "10-digit mobile phone number of the recipient", example = "9876543210")
    @NotBlank(message = "Recipient phone is required")
    @Pattern(
            regexp = "^[6-9][0-9]{9}$",
            message = "Invalid Indian mobile phone number. Must be a 10-digit number starting with 6-9."
    )
    private String recipientPhone;

    @Schema(description = "Full pickup address details", example = "Plot 14, Sector 62")
    @NotBlank(message = "Pickup address is required")
    @Size(max = 300, message = "Pickup address cannot exceed 300 characters")
    private String pickupAddress;

    @Schema(description = "Pickup city name", example = "Noida")
    @NotBlank(message = "Pickup city is required")
    @Size(max = 100, message = "Pickup city name cannot exceed 100 characters")
    private String pickupCity;

    @Schema(description = "6-digit Indian postal code for pickup", example = "201309")
    @NotBlank(message = "Pickup pincode is required")
    @Pattern(
            regexp = "^[1-9][0-9]{5}$",
            message = "Invalid pickup pincode. Must be a valid 6-digit postal code."
    )
    private String pickupPincode;

    @Schema(description = "Full delivery address details", example = "House 210, MG Road")
    @NotBlank(message = "Delivery address is required")
    @Size(max = 300, message = "Delivery address cannot exceed 300 characters")
    private String deliveryAddress;

    @Schema(description = "Delivery city name", example = "Gurugram")
    @NotBlank(message = "Delivery city is required")
    @Size(max = 100, message = "Delivery city name cannot exceed 100 characters")
    private String deliveryCity;

    @Schema(description = "6-digit Indian postal code for delivery", example = "122001")
    @NotBlank(message = "Delivery pincode is required")
    @Pattern(
            regexp = "^[1-9][0-9]{5}$",
            message = "Invalid delivery pincode. Must be a valid 6-digit postal code."
    )
    private String deliveryPincode;

    @Schema(description = "Actual physical weight of the parcel in kilograms", example = "2.5")
    @NotNull(message = "Weight is required")
    @DecimalMin(value = "0.1", message = "Weight must be at least 0.1 kg")
    @DecimalMax(value = "100.0", message = "Weight cannot exceed 100 kg")
    private Double weight;

    @Schema(description = "Length of the parcel in centimeters", example = "25")
    @NotNull(message = "Length is required")
    @DecimalMin(value = "1.0", message = "Length must be at least 1 cm")
    private Double length;

    @Schema(description = "Breadth of the parcel in centimeters", example = "20")
    @NotNull(message = "Breadth is required")
    @DecimalMin(value = "1.0", message = "Breadth must be at least 1 cm")
    private Double breadth;

    @Schema(description = "Height of the parcel in centimeters", example = "15")
    @NotNull(message = "Height is required")
    @DecimalMin(value = "1.0", message = "Height must be at least 1 cm")
    private Double height;

    @Schema(description = "Flag representing Cash-On-Delivery status", example = "false")
    @Builder.Default
    private boolean isCod = false;

    @Schema(description = "Optional COD collection amount (required if isCod is true)", example = "1500.0")
    @PositiveOrZero(message = "COD amount cannot be negative")
    private Double codAmount;

    @Schema(description = "Optional card configuration type (defaults to B2C)", example = "B2C")
    @Builder.Default
    private CardType cardType = CardType.B2C;

    @AssertTrue(message = "COD amount is required and must be greater than zero when isCod is true")
    public boolean isValidCod() {
        if (!isCod) {
            return true;
        }
        return codAmount != null && codAmount > 0;
    }
}