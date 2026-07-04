package com.lastmiletracker.setting.controller;

import com.lastmiletracker.common.response.ApiResponse;
import com.lastmiletracker.setting.dto.*;
import com.lastmiletracker.setting.service.SystemSettingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/settings")
@Tag(name = "System Setting Controller", description = "Endpoints for managing global system configurations, business parameters, SMTP, payments, and security rules")
@Slf4j
@SecurityRequirement(name = "bearerAuth")
public class SystemSettingController {

    private final SystemSettingService settingService;

    public SystemSettingController(SystemSettingService settingService) {
        this.settingService = settingService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all system configurations (Admin only)")
    public ResponseEntity<ApiResponse<List<SystemSettingResponse>>> getAllSettings() {
        List<SystemSettingResponse> response = settingService.getAllSettings();
        return ResponseEntity.ok(ApiResponse.success("All settings retrieved successfully!", response));
    }

    @GetMapping("/category/{category}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get settings filtered by category (Admin only)")
    public ResponseEntity<ApiResponse<List<SystemSettingResponse>>> getSettingsByCategory(
            @PathVariable String category) {
        List<SystemSettingResponse> response = settingService.getSettingsByCategory(category);
        return ResponseEntity.ok(ApiResponse.success("Category settings retrieved successfully!", response));
    }

    @GetMapping("/{key}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get a specific setting configuration details by key (Admin only)")
    public ResponseEntity<ApiResponse<SystemSettingResponse>> getSettingByKey(
            @PathVariable String key) {
        SystemSettingResponse response = settingService.getSettingByKey(key);
        return ResponseEntity.ok(ApiResponse.success("Setting retrieved successfully!", response));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a custom system setting configuration key-value pair (Admin only)")
    public ResponseEntity<ApiResponse<SystemSettingResponse>> createSetting(
            @RequestParam String key,
            @RequestBody SystemSettingRequest request) {
        SystemSettingResponse response = settingService.createSetting(key, request);
        return ResponseEntity.ok(ApiResponse.success("System setting created successfully!", response));
    }

    @PutMapping("/{key}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update an existing system configuration setting value (Admin only)")
    public ResponseEntity<ApiResponse<SystemSettingResponse>> updateSetting(
            @PathVariable String key,
            @RequestBody SystemSettingRequest request) {
        SystemSettingResponse response = settingService.updateSetting(key, request);
        return ResponseEntity.ok(ApiResponse.success("System setting updated successfully!", response));
    }

    @DeleteMapping("/{key}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete an editable system configuration setting key-value pair (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteSetting(
            @PathVariable String key) {
        settingService.deleteSetting(key);
        return ResponseEntity.ok(ApiResponse.success("System setting deleted successfully!", null));
    }

    @PostMapping("/reset-defaults")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Reset all system configurations to baseline factory default values (Admin only)")
    public ResponseEntity<ApiResponse<Void>> resetDefaults() {
        settingService.resetToDefaults();
        return ResponseEntity.ok(ApiResponse.success("All system settings reset to defaults successfully!", null));
    }

    @GetMapping("/application")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get flat application configurations mapping (Accessible to all authenticated users)")
    public ResponseEntity<ApiResponse<ApplicationConfigurationResponse>> getApplicationConfig() {
        ApplicationConfigurationResponse response = settingService.getApplicationConfig();
        return ResponseEntity.ok(ApiResponse.success("Application configuration loaded successfully!", response));
    }
}
