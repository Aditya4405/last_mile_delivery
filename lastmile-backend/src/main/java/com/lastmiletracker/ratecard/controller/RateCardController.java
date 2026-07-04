package com.lastmiletracker.ratecard.controller;

import com.lastmiletracker.common.response.ApiResponse;
import com.lastmiletracker.ratecard.dto.RateCardRequest;
import com.lastmiletracker.ratecard.dto.RateCardResponse;
import com.lastmiletracker.ratecard.service.RateCardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rate-cards")
@Tag(name = "Rate Card Controller", description = "Endpoints for managing billing rates, pricing tiers, and COD charges")
@SecurityRequirement(name = "bearerAuth")
public class RateCardController {

    private final RateCardService rateCardService;

    public RateCardController(RateCardService rateCardService) {
        this.rateCardService = rateCardService;
    }

    @GetMapping
    @Operation(summary = "List all registered rate cards")
    public ResponseEntity<ApiResponse<List<RateCardResponse>>> getAllRateCards() {
        List<RateCardResponse> response = rateCardService.getAllRateCards();
        return ResponseEntity.ok(ApiResponse.success("Rate cards fetched successfully!", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get rate card by unique ID")
    public ResponseEntity<ApiResponse<RateCardResponse>> getRateCardById(@PathVariable Long id) {
        RateCardResponse response = rateCardService.getRateCardById(id);
        return ResponseEntity.ok(ApiResponse.success("Rate card details fetched successfully!", response));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new rate card (Admin only)")
    public ResponseEntity<ApiResponse<RateCardResponse>> createRateCard(@Valid @RequestBody RateCardRequest request) {
        RateCardResponse response = rateCardService.createRateCard(request);
        return new ResponseEntity<>(ApiResponse.success("Rate card created successfully!", response), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update an existing rate card configuration (Admin only)")
    public ResponseEntity<ApiResponse<RateCardResponse>> updateRateCard(
            @PathVariable Long id,
            @Valid @RequestBody RateCardRequest request) {
        RateCardResponse response = rateCardService.updateRateCard(id, request);
        return ResponseEntity.ok(ApiResponse.success("Rate card updated successfully!", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete an existing rate card configuration (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteRateCard(@PathVariable Long id) {
        rateCardService.deleteRateCard(id);
        return ResponseEntity.ok(ApiResponse.success("Rate card deleted successfully!"));
    }
}
