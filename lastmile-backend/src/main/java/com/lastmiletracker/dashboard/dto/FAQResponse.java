package com.lastmiletracker.dashboard.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FAQResponse {

    @Schema(description = "ID of the FAQ item", example = "1")
    private Long id;

    @Schema(description = "FAQ question", example = "How can I track my shipment?")
    private String question;

    @Schema(description = "FAQ answer description", example = "You can enter your LM tracking number on the tracking page to view the live timeline.")
    private String answer;

    @Schema(description = "FAQ category group", example = "General")
    private String category;
}
