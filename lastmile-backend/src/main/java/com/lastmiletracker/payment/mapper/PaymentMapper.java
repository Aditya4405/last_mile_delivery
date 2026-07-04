package com.lastmiletracker.payment.mapper;

import com.lastmiletracker.payment.dto.PaymentResponse;
import com.lastmiletracker.payment.entity.Payment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PaymentMapper {

    @Mapping(target = "orderId", source = "order.id")
    @Mapping(target = "trackingNumber", source = "order.trackingNumber")
    @Mapping(target = "customerName", source = "customer.fullName")
    @Mapping(target = "status", expression = "java(payment.getStatus().name())")
    PaymentResponse toResponse(Payment payment);
}
