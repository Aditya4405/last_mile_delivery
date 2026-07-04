package com.lastmiletracker.order.dto;

import com.lastmiletracker.order.entity.OrderStatus;
import com.lastmiletracker.ratecard.entity.CardType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderResponse {

    @Schema(description = "Database ID of the order", example = "1")
    private Long id;

    @Schema(description = "Unique alphanumeric tracking number", example = "LM260703483921")
    private String trackingNumber;

    @Schema(description = "Current operational delivery status")
    private OrderStatus status;

    @Schema(description = "ID of the customer who booked the shipment")
    private Long senderId;

    @Schema(description = "Full name of the customer")
    private String senderName;

    @Schema(description = "Email of the customer")
    private String senderEmail;

    @Schema(description = "Phone number of the customer")
    private String senderPhone;

    @Schema(description = "Recipient contact name")
    private String recipientName;

    @Schema(description = "Recipient phone number")
    private String recipientPhone;

    @Schema(description = "Pickup physical address")
    private String pickupAddress;

    @Schema(description = "Pickup city")
    private String pickupCity;

    @Schema(description = "Pickup postal pincode")
    private String pickupPincode;

    @Schema(description = "Delivery destination address")
    private String deliveryAddress;

    @Schema(description = "Delivery city")
    private String deliveryCity;

    @Schema(description = "Delivery destination pincode")
    private String deliveryPincode;

    @Schema(description = "Weight in kg")
    private Double weight;

    @Schema(description = "Length in cm")
    private Double length;

    @Schema(description = "Breadth in cm")
    private Double breadth;

    @Schema(description = "Height in cm")
    private Double height;

    @Schema(description = "Volumetric weight calculation")
    private Double volumetricWeight;

    @Schema(description = "Billable weight determined (max of actual and volumetric weight)")
    private Double billableWeight;

    @Schema(description = "Calculated final shipping charge")
    private Double shippingCharge;

    @Schema(description = "Cash collection amount for COD orders")
    private Double codAmount;

    @Schema(description = "Cash-On-Delivery status indicator")
    private boolean isCod;

    @Schema(description = "Assigned Rate Card type")
    private CardType cardType;

    @Schema(description = "Database ID of the pickup zone")
    private Long pickupZoneId;

    @Schema(description = "Name of the resolved pickup zone")
    private String pickupZoneName;

    @Schema(description = "Database ID of the delivery zone")
    private Long deliveryZoneId;

    @Schema(description = "Name of the resolved delivery zone")
    private String deliveryZoneName;

    @Schema(description = "ID of the assigned delivery agent")
    private Long assignedAgentId;

    @Schema(description = "Full name of the assigned delivery agent")
    private String assignedAgentName;

    @Schema(description = "Phone number of the assigned delivery agent")
    private String assignedAgentPhone;

    @Schema(description = "Vehicle type used by the assigned agent")
    private String vehicleType;

    @Schema(description = "Assigned agent's current location latitude coordinate")
    private Double agentLatitude;

    @Schema(description = "Assigned agent's current location longitude coordinate")
    private Double agentLongitude;

    @Schema(description = "Detailed audit calculation log")
    private String calculationDetails;

    @Schema(description = "Remarks/Internal notes about the delivery")
    private String remarks;

    @Schema(description = "Description/Reason for order cancellation")
    private String cancellationReason;

    @Schema(description = "Description/Reason for delivery failure")
    private String failureReason;

    @Schema(description = "Timestamp when order was placed")
    private LocalDateTime createdAt;

    @Schema(description = "Timestamp when order details were last updated")
    private LocalDateTime updatedAt;

    @Schema(description = "Estimated arrival/delivery time of shipment")
    private LocalDateTime estimatedDeliveryTime;

    @Schema(description = "Timestamp when order reached terminal delivered state")
    private LocalDateTime deliveredAt;

    public boolean isCompleted() {
        return status == OrderStatus.DELIVERED
                || status == OrderStatus.CANCELLED
                || status == OrderStatus.FAILED;
    }

    public boolean isActive() {
        return !isCompleted();
    }

    public boolean isAssigned() {
        return assignedAgentId != null;
    }

    public boolean canCancel() {
        return status == OrderStatus.ORDER_CREATED
                || status == OrderStatus.CONFIRMED
                || status == OrderStatus.ASSIGNED;
    }

    public boolean canTrack() {
        return status != OrderStatus.ORDER_CREATED
                && status != OrderStatus.CANCELLED;
    }
}