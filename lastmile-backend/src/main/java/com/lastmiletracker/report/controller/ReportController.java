package com.lastmiletracker.report.controller;

import com.lastmiletracker.common.response.ApiResponse;
import com.lastmiletracker.exception.ResourceNotFoundException;
import com.lastmiletracker.report.dto.*;
import com.lastmiletracker.report.service.ReportService;
import com.lastmiletracker.user.entity.User;
import com.lastmiletracker.user.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@Tag(name = "Reporting & Export Controller", description = "Endpoints for generating operational PDF, Excel, and CSV reports with parameters filters")
@SecurityRequirement(name = "bearerAuth")
@Slf4j
public class ReportController {

    private final ReportService reportService;
    private final UserRepository userRepository;

    public ReportController(ReportService reportService, UserRepository userRepository) {
        this.reportService = reportService;
        this.userRepository = userRepository;
    }

    @GetMapping("/revenue")
    @Operation(summary = "Generate financial revenue ledger analytics report")
    public ResponseEntity<ApiResponse<RevenueReportResponse>> getRevenueReport(
            ReportFilterRequest filters) {
        User user = getAuthenticatedUser();
        RevenueReportResponse response = reportService.getRevenueReport(filters, user);
        return ResponseEntity.ok(ApiResponse.success("Revenue analytics fetched successfully!", response));
    }

    @GetMapping("/orders")
    @Operation(summary = "Generate shipment orders distribution analytics report")
    public ResponseEntity<ApiResponse<OrderReportResponse>> getOrderReport(
            ReportFilterRequest filters) {
        User user = getAuthenticatedUser();
        OrderReportResponse response = reportService.getOrderReport(filters, user);
        return ResponseEntity.ok(ApiResponse.success("Order analytics fetched successfully!", response));
    }

    @GetMapping("/customers")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Generate customer growth metrics report (Admin only)")
    public ResponseEntity<ApiResponse<CustomerReportResponse>> getCustomerReport(
            ReportFilterRequest filters) {
        User user = getAuthenticatedUser();
        CustomerReportResponse response = reportService.getCustomerReport(filters, user);
        return ResponseEntity.ok(ApiResponse.success("Customer analytics report generated successfully!", response));
    }

    @GetMapping("/agents")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Generate delivery executives workload profiles report (Admin only)")
    public ResponseEntity<ApiResponse<DeliveryAgentReportResponse>> getDeliveryAgentReport(
            ReportFilterRequest filters) {
        User user = getAuthenticatedUser();
        DeliveryAgentReportResponse response = reportService.getDeliveryAgentReport(filters, user);
        return ResponseEntity.ok(ApiResponse.success("Rider profiles analytics report generated successfully!", response));
    }

    @GetMapping("/zones")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Generate zone operational distribution report (Admin only)")
    public ResponseEntity<ApiResponse<ZoneReportResponse>> getZoneReport(
            ReportFilterRequest filters) {
        User user = getAuthenticatedUser();
        ZoneReportResponse response = reportService.getZoneReport(filters, user);
        return ResponseEntity.ok(ApiResponse.success("Zone analytics report generated successfully!", response));
    }

    @GetMapping("/areas")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Generate delivery city area operational distribution report (Admin only)")
    public ResponseEntity<ApiResponse<AreaReportResponse>> getAreaReport(
            ReportFilterRequest filters) {
        User user = getAuthenticatedUser();
        AreaReportResponse response = reportService.getAreaReport(filters, user);
        return ResponseEntity.ok(ApiResponse.success("Area distribution analytics report generated successfully!", response));
    }

    @GetMapping("/tracking")
    @Operation(summary = "Generate shipment delivery SLA compliance report")
    public ResponseEntity<ApiResponse<TrackingReportResponse>> getTrackingReport(
            ReportFilterRequest filters) {
        User user = getAuthenticatedUser();
        TrackingReportResponse response = reportService.getTrackingReport(filters, user);
        return ResponseEntity.ok(ApiResponse.success("SLA tracking compliance report generated successfully!", response));
    }

    @GetMapping("/dashboard-summary")
    @Operation(summary = "Get general reports dashboard summary statistics")
    public ResponseEntity<ApiResponse<ReportSummaryResponse>> getDashboardSummary(
            ReportFilterRequest filters) {
        User user = getAuthenticatedUser();
        ReportSummaryResponse response = reportService.getDashboardSummary(filters, user);
        return ResponseEntity.ok(ApiResponse.success("Reports overview summary fetched!", response));
    }

    @PostMapping("/export/pdf")
    @Operation(summary = "Export filtered report to a styled PDF document")
    public ResponseEntity<byte[]> exportToPDF(@RequestBody ExportRequest request) {
        User user = getAuthenticatedUser();
        byte[] pdfBytes = reportService.exportToPDF(request, user);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "LogisticsReport.pdf");
        headers.setContentLength(pdfBytes.length);

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }

    @PostMapping("/export/excel")
    @Operation(summary = "Export filtered report to a formatted Microsoft Excel spreadsheet")
    public ResponseEntity<byte[]> exportToExcel(@RequestBody ExportRequest request) {
        User user = getAuthenticatedUser();
        byte[] excelBytes = reportService.exportToExcel(request, user);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
        headers.setContentDispositionFormData("attachment", "LogisticsReport.xlsx");
        headers.setContentLength(excelBytes.length);

        return new ResponseEntity<>(excelBytes, headers, HttpStatus.OK);
    }

    @PostMapping("/export/csv")
    @Operation(summary = "Export filtered report to a UTF-8 compatible CSV text file")
    public ResponseEntity<byte[]> exportToCSV(@RequestBody ExportRequest request) {
        User user = getAuthenticatedUser();
        byte[] csvBytes = reportService.exportToCSV(request, user);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv;charset=utf-8"));
        headers.setContentDispositionFormData("attachment", "LogisticsReport.csv");
        headers.setContentLength(csvBytes.length);

        return new ResponseEntity<>(csvBytes, headers, HttpStatus.OK);
    }

    private User getAuthenticatedUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Authenticated user profile not found"));
    }
}
