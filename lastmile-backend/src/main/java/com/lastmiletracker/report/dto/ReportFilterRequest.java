package com.lastmiletracker.report.dto;

import com.lastmiletracker.order.entity.OrderStatus;
import com.lastmiletracker.ratecard.entity.CardType;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportFilterRequest {

    @Schema(description = "Start date for filtering", example = "2026-07-01")
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate fromDate;

    @Schema(description = "End date for filtering", example = "2026-07-31")
    @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
    private LocalDate toDate;

    @Schema(description = "Shipment order status")
    private OrderStatus status;

    @Schema(description = "Pickup or delivery zone ID", example = "1")
    private Long zoneId;

    @Schema(description = "Delivery area ID", example = "2")
    private Long areaId;

    @Schema(description = "Customer ID", example = "10")
    private Long customerId;

    @Schema(description = "Delivery Agent ID", example = "5")
    private Long agentId;

    @Schema(description = "Rate card pricing type classification")
    private CardType cardType;

    @Schema(description = "Payment mode type (COD / PREPAID)", example = "COD")
    private String paymentType;

    @Schema(description = "Cash-On-Delivery status indicator", example = "true")
    private Boolean cod;
}
