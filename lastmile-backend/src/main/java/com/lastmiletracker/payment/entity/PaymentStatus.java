package com.lastmiletracker.payment.entity;

public enum PaymentStatus {
    PENDING,
    CREATED,
    AUTHORIZED,
    CAPTURED,
    FAILED,
    REFUNDED,
    CANCELLED
}
