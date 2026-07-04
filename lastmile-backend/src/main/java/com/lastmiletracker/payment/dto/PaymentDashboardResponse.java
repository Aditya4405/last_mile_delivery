package com.lastmiletracker.payment.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentDashboardResponse {

    @Schema(description = "Total payments value captured", example = "24000.0")
    private Double totalPaid;

    @Schema(description = "COD collections currently outstanding", example = "3500.0")
    private Double pendingCod;

    @Schema(description = "Count of online capture transactions", example = "45")
    private Long onlinePaymentsCount;

    @Schema(description = "Count of failed transactions", example = "8")
    private Long failedPaymentsCount;

    @Schema(description = "Count of refund operations triggered", example = "2")
    private Long refundsCount;

    @Schema(description = "Recent payment transactions records list")
    private List<PaymentResponse> recentPayments;
}
