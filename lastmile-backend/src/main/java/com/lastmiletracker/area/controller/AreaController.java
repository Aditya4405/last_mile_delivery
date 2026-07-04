package com.lastmiletracker.area.controller;

import com.lastmiletracker.area.dto.AreaRequest;
import com.lastmiletracker.area.dto.AreaResponse;
import com.lastmiletracker.area.service.AreaService;
import com.lastmiletracker.common.response.ApiResponse;
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
@RequestMapping("/api/areas")
@Tag(name = "Area Controller", description = "Endpoints for managing areas associated with delivery zones")
@SecurityRequirement(name = "bearerAuth")
public class AreaController {

    private final AreaService areaService;

    public AreaController(AreaService areaService) {
        this.areaService = areaService;
    }

    @GetMapping
    @Operation(summary = "List all active coverage areas")
    public ResponseEntity<ApiResponse<List<AreaResponse>>> getAllAreas() {
        List<AreaResponse> response = areaService.getAllAreas();
        return ResponseEntity.ok(ApiResponse.success("Areas fetched successfully!", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get area by unique ID")
    public ResponseEntity<ApiResponse<AreaResponse>> getAreaById(@PathVariable Long id) {
        AreaResponse response = areaService.getAreaById(id);
        return ResponseEntity.ok(ApiResponse.success("Area details fetched successfully!", response));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new coverage area linked to a zone (Admin only)")
    public ResponseEntity<ApiResponse<AreaResponse>> createArea(@Valid @RequestBody AreaRequest request) {
        AreaResponse response = areaService.createArea(request);
        return new ResponseEntity<>(ApiResponse.success("Area created successfully!", response), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update an existing coverage area (Admin only)")
    public ResponseEntity<ApiResponse<AreaResponse>> updateArea(
            @PathVariable Long id,
            @Valid @RequestBody AreaRequest request) {
        AreaResponse response = areaService.updateArea(id, request);
        return ResponseEntity.ok(ApiResponse.success("Area updated successfully!", response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete an existing coverage area (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteArea(@PathVariable Long id) {
        areaService.deleteArea(id);
        return ResponseEntity.ok(ApiResponse.success("Area deleted successfully!"));
    }
}
