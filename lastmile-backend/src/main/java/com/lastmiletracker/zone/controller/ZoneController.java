package com.lastmiletracker.zone.controller;

import com.lastmiletracker.common.response.ApiResponse;
import com.lastmiletracker.zone.dto.ZoneRequest;
import com.lastmiletracker.zone.dto.ZoneResponse;
import com.lastmiletracker.zone.service.ZoneService;
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
@RequestMapping("/api/zones")
@Tag(name = "Zone Controller", description = "Endpoints for managing delivery zones and automated zone detection")
@SecurityRequirement(name = "bearerAuth")
public class ZoneController {

    private final ZoneService zoneService;

    public ZoneController(ZoneService zoneService) {
        this.zoneService = zoneService;
    }

    @GetMapping
    @Operation(summary = "List all active geographical zones")
    public ResponseEntity<ApiResponse<List<ZoneResponse>>> getAllZones() {
        List<ZoneResponse> response = zoneService.getAllZones();
        return ResponseEntity.ok(ApiResponse.success("Zones fetched successfully!", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get zone by unique ID")
    public ResponseEntity<ApiResponse<ZoneResponse>> getZoneById(@PathVariable Long id) {
        ZoneResponse response = zoneService.getZoneById(id);
        return ResponseEntity.ok(ApiResponse.success("Zone details fetched successfully!", response));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new zone (Admin only)")
    public ResponseEntity<ApiResponse<ZoneResponse>> createZone(@Valid @RequestBody ZoneRequest request) {
        ZoneResponse response = zoneService.createZone(request);
        return new ResponseEntity<>(ApiResponse.success("Zone created successfully!", response), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update an existing zone (Admin only)")
    public ResponseEntity<ApiResponse<ZoneResponse>> updateZone(
            @PathVariable Long id,
            @Valid @RequestBody ZoneRequest request) {
        ZoneResponse response = zoneService.updateZone(id, request);
        return ResponseEntity.ok(ApiResponse.success("Zone updated successfully!", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete an existing zone (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteZone(@PathVariable Long id) {
        zoneService.deleteZone(id);
        return ResponseEntity.ok(ApiResponse.success("Zone deleted successfully!"));
    }

    @GetMapping("/detect")
    @Operation(summary = "Detect zone based on pincode or GPS coordinates (latitude/longitude)")
    public ResponseEntity<ApiResponse<ZoneResponse>> detectZone(
            @RequestParam(required = false) String pincode,
            @RequestParam(required = false) Double latitude,
            @RequestParam(required = false) Double longitude) {
        ZoneResponse response = zoneService.detectZone(pincode, latitude, longitude);
        return ResponseEntity.ok(ApiResponse.success("Zone detected successfully!", response));
    }
}
