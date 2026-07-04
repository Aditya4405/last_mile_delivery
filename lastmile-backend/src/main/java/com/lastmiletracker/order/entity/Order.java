package com.lastmiletracker.order.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.lastmiletracker.agent.entity.DeliveryAgent;
import com.lastmiletracker.ratecard.entity.CardType;
import com.lastmiletracker.user.entity.User;
import com.lastmiletracker.zone.entity.Zone;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.DynamicInsert;
import org.hibernate.annotations.DynamicUpdate;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "orders",
        indexes = {
                @Index(name = "idx_order_tracking", columnList = "tracking_number"),
                @Index(name = "idx_order_status", columnList = "status"),
                @Index(name = "idx_order_sender", columnList = "sender_id"),
                @Index(name = "idx_order_agent", columnList = "assigned_agent_id"),
                @Index(name = "idx_order_created", columnList = "created_at")
        }
)
@EntityListeners(AuditingEntityListener.class)
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@DynamicInsert
@DynamicUpdate
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "tracking_number", nullable = false, unique = true, length = 20)
    private String trackingNumber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    @JsonIgnore
    private User sender;

    @Column(name = "recipient_name", nullable = false)
    private String recipientName;

    @Column(name = "recipient_phone", nullable = false, length = 15)
    private String recipientPhone;

    @Column(name = "pickup_address", nullable = false, length = 300)
    private String pickupAddress;

    @Column(name = "pickup_city", nullable = false)
    private String pickupCity;

    @Column(name = "pickup_pincode", nullable = false, length = 6)
    private String pickupPincode;

    @Column(name = "delivery_address", nullable = false, length = 300)
    private String deliveryAddress;

    @Column(name = "delivery_city", nullable = false)
    private String deliveryCity;

    @Column(name = "delivery_pincode", nullable = false, length = 6)
    private String deliveryPincode;

    @Column(nullable = false)
    private Double weight;

    @Column(nullable = false)
    private Double length;

    @Column(nullable = false)
    private Double breadth;

    @Column(nullable = false)
    private Double height;

    @Column(name = "volumetric_weight", nullable = false)
    private Double volumetricWeight;

    @Column(name = "billable_weight", nullable = false)
    private Double billableWeight;

    @Column(name = "shipping_charge", nullable = false)
    private Double shippingCharge;

    @Column(name = "cod_amount")
    @Builder.Default
    private Double codAmount = 0.0;

    @Column(name = "is_cod", nullable = false)
    @Builder.Default
    private boolean isCod = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "card_type", nullable = false)
    private CardType cardType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private OrderStatus status = OrderStatus.ORDER_CREATED;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_agent_id")
    @JsonIgnore
    private DeliveryAgent assignedAgent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pickup_zone_id")
    @JsonIgnore
    private Zone pickupZone;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "delivery_zone_id")
    @JsonIgnore
    private Zone deliveryZone;

    @Column(name = "calculation_details", length = 3000)
    private String calculationDetails;

    @Column(length = 500)
    private String remarks;

    @Column(name = "cancellation_reason", length = 100)
    private String cancellationReason;

    @Column(name = "failure_reason", length = 100)
    private String failureReason;

    @Column(name = "estimated_delivery_time")
    private LocalDateTime estimatedDeliveryTime;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Transient
    public boolean isAssigned() {
        return assignedAgent != null;
    }

    @Transient
    public boolean isDelivered() {
        return status == OrderStatus.DELIVERED;
    }

    @Transient
    public boolean isCancelled() {
        return status == OrderStatus.CANCELLED;
    }

    @Transient
    public boolean isFailed() {
        return status == OrderStatus.FAILED;
    }

    @Transient
    public boolean isCompleted() {
        return status == OrderStatus.DELIVERED
                || status == OrderStatus.CANCELLED
                || status == OrderStatus.FAILED;
    }

    @Transient
    public boolean isActive() {
        return !isCompleted();
    }

    @Transient
    public boolean canAssignAgent() {
        return status == OrderStatus.ORDER_CREATED
                || status == OrderStatus.CONFIRMED;
    }

    @Transient
    public boolean canCancel() {
        return status == OrderStatus.ORDER_CREATED
                || status == OrderStatus.CONFIRMED
                || status == OrderStatus.ASSIGNED;
    }

    @Transient
    public boolean canDeliver() {
        return status == OrderStatus.OUT_FOR_DELIVERY;
    }

    @PrePersist
    public void prePersist() {
        if (status == null) {
            status = OrderStatus.ORDER_CREATED;
        }
        if (shippingCharge == null) {
            shippingCharge = 0.0;
        }
        if (codAmount == null) {
            codAmount = 0.0;
        }
        if (billableWeight == null) {
            billableWeight = weight;
        }
        if (volumetricWeight == null) {
            volumetricWeight = weight;
        }
        if (cardType == null) {
            cardType = CardType.B2C;
        }
    }

    @Override
    public String toString() {
        return "Order{" +
                "id=" + id +
                ", trackingNumber='" + trackingNumber + '\'' +
                ", status=" + status +
                ", recipient='" + recipientName + '\'' +
                '}';
    }
}