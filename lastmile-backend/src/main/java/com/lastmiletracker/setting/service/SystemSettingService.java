package com.lastmiletracker.setting.service;

import com.lastmiletracker.exception.BadRequestException;
import com.lastmiletracker.exception.ResourceNotFoundException;
import com.lastmiletracker.setting.dto.*;
import com.lastmiletracker.setting.entity.SystemSetting;
import com.lastmiletracker.setting.mapper.SystemSettingMapper;
import com.lastmiletracker.setting.repository.SystemSettingRepository;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
@Slf4j
public class SystemSettingService {

    private final SystemSettingRepository settingRepository;
    private final SystemSettingMapper settingMapper;

    // Thread-safe in-memory cache
    private final Map<String, String> settingsCache = new ConcurrentHashMap<>();

    public SystemSettingService(
            SystemSettingRepository settingRepository,
            SystemSettingMapper settingMapper) {
        this.settingRepository = settingRepository;
        this.settingMapper = settingMapper;
    }

    /**
     * Cache initialization
     */
    @PostConstruct
    public void init() {
        long count = settingRepository.count();
        if (count == 0) {
            log.info("Database system configurations empty. Seeding defaults...");
            resetToDefaults();
        } else {
            refreshCache();
        }
    }

    /**
     * Refresh settings cache from database
     */
    public void refreshCache() {
        List<SystemSetting> all = settingRepository.findAll();
        settingsCache.clear();
        for (SystemSetting s : all) {
            settingsCache.put(s.getSettingKey(), s.getSettingValue() != null ? s.getSettingValue() : "");
        }
        log.info("System settings memory cache loaded: {} configurations", settingsCache.size());
    }

    /* ===========================================================
       Cache Getters for application integrations
       =========================================================== */

    public String getSetting(String key, String defaultValue) {
        String val = settingsCache.get(key);
        return val != null ? val : defaultValue;
    }

    public Integer getSettingAsInteger(String key, Integer defaultValue) {
        String val = settingsCache.get(key);
        if (val == null || val.isBlank()) return defaultValue;
        try {
            return Integer.parseInt(val.trim());
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    public Double getSettingAsDouble(String key, Double defaultValue) {
        String val = settingsCache.get(key);
        if (val == null || val.isBlank()) return defaultValue;
        try {
            return Double.parseDouble(val.trim());
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    public Boolean getSettingAsBoolean(String key, Boolean defaultValue) {
        String val = settingsCache.get(key);
        if (val == null || val.isBlank()) return defaultValue;
        return Boolean.parseBoolean(val.trim());
    }

    /* ===========================================================
       Service REST mapping implementations
       =========================================================== */

    public List<SystemSettingResponse> getAllSettings() {
        return settingRepository.findAllByOrderByCategoryAscSettingKeyAsc().stream()
                .map(settingMapper::toResponse)
                .collect(Collectors.toList());
    }

    public List<SystemSettingResponse> getSettingsByCategory(String category) {
        return settingRepository.findByCategory(category.toUpperCase()).stream()
                .map(settingMapper::toResponse)
                .collect(Collectors.toList());
    }

    public SystemSettingResponse getSettingByKey(String key) {
        SystemSetting setting = settingRepository.findBySettingKey(key.toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Configuration key not found: " + key));
        return settingMapper.toResponse(setting);
    }

    @Transactional
    public SystemSettingResponse createSetting(String key, SystemSettingRequest request) {
        if (settingRepository.findBySettingKey(key.toUpperCase()).isPresent()) {
            throw new BadRequestException("Configuration key already exists: " + key);
        }

        SystemSetting setting = SystemSetting.builder()
                .settingKey(key.toUpperCase())
                .settingValue(request.getSettingValue())
                .category(request.getCategory() != null ? request.getCategory().toUpperCase() : "SYSTEM")
                .description(request.getDescription())
                .editable(true)
                .build();

        settingRepository.save(setting);
        refreshCache();
        return settingMapper.toResponse(setting);
    }

    @Transactional
    public SystemSettingResponse updateSetting(String key, SystemSettingRequest request) {
        SystemSetting setting = settingRepository.findBySettingKey(key.toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Configuration key not found: " + key));

        if (!setting.isEditable()) {
            throw new BadRequestException("Configuration key " + key + " is read-only and cannot be edited");
        }

        setting.setSettingValue(request.getSettingValue());
        if (request.getDescription() != null) {
            setting.setDescription(request.getDescription());
        }
        settingRepository.save(setting);
        refreshCache();
        return settingMapper.toResponse(setting);
    }

    @Transactional
    public void deleteSetting(String key) {
        SystemSetting setting = settingRepository.findBySettingKey(key.toUpperCase())
                .orElseThrow(() -> new ResourceNotFoundException("Configuration key not found: " + key));

        if (!setting.isEditable()) {
            throw new BadRequestException("Configuration key " + key + " is read-only and cannot be deleted");
        }

        settingRepository.delete(setting);
        refreshCache();
    }

    @Transactional
    public void resetToDefaults() {
        settingRepository.deleteAll();

        List<SystemSetting> defaults = new ArrayList<>();

        // General
        defaults.add(new SystemSetting(null, "COMPANY_NAME", "LogiTrack Logistics", "GENERAL", "Company official business name", true, null, null));
        defaults.add(new SystemSetting(null, "COMPANY_EMAIL", "support@logitrack-logistics.in", "GENERAL", "Support contact email", true, null, null));
        defaults.add(new SystemSetting(null, "COMPANY_PHONE", "+91 9876543210", "GENERAL", "Support contact phone line", true, null, null));
        defaults.add(new SystemSetting(null, "COMPANY_ADDRESS", "Plot 14, Sector 62, Noida, India", "GENERAL", "Corporate headquarters address", true, null, null));
        defaults.add(new SystemSetting(null, "COMPANY_WEBSITE", "https://logitrack-logistics.in", "GENERAL", "Official company website URL", true, null, null));
        defaults.add(new SystemSetting(null, "SUPPORT_EMAIL", "help@logitrack-logistics.in", "GENERAL", "Customer helpdesk email", true, null, null));
        defaults.add(new SystemSetting(null, "SUPPORT_PHONE", "1800-123-4567", "GENERAL", "Customer toll-free support number", true, null, null));
        defaults.add(new SystemSetting(null, "TIMEZONE", "Asia/Kolkata", "GENERAL", "System operation default timezone", true, null, null));
        defaults.add(new SystemSetting(null, "CURRENCY", "INR", "GENERAL", "System billing currency format", true, null, null));
        defaults.add(new SystemSetting(null, "LANGUAGE", "en", "GENERAL", "Default application localization language", true, null, null));
        defaults.add(new SystemSetting(null, "DATE_FORMAT", "yyyy-MM-dd", "GENERAL", "Default system display date formatting", true, null, null));
        defaults.add(new SystemSetting(null, "TIME_FORMAT", "HH:mm:ss", "GENERAL", "Default system display time formatting", true, null, null));
        defaults.add(new SystemSetting(null, "LOGO_URL", "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=128", "GENERAL", "LogiTrack branding logo image URL", true, null, null));
        defaults.add(new SystemSetting(null, "FAVICON_URL", "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=32", "GENERAL", "Website favicon link icon URL", true, null, null));

        // Business
        defaults.add(new SystemSetting(null, "GST_PERCENTAGE", "18.0", "BUSINESS", "Goods and Services Tax percentage", true, null, null));
        defaults.add(new SystemSetting(null, "DEFAULT_SHIPPING_CHARGE", "50.0", "BUSINESS", "Default shipping delivery base charge", true, null, null));
        defaults.add(new SystemSetting(null, "DEFAULT_COD_CHARGE", "30.0", "BUSINESS", "Default COD handling processing fee", true, null, null));
        defaults.add(new SystemSetting(null, "FREE_SHIPPING_THRESHOLD", "1000.0", "BUSINESS", "Subtotal amount eligible for free shipping waiver", true, null, null));
        defaults.add(new SystemSetting(null, "MAX_PARCEL_WEIGHT", "50.0", "BUSINESS", "Maximum weight in kg per booking consignment", true, null, null));
        defaults.add(new SystemSetting(null, "MIN_PARCEL_WEIGHT", "0.1", "BUSINESS", "Minimum weight in kg per booking consignment", true, null, null));
        defaults.add(new SystemSetting(null, "MAX_COD_AMOUNT", "50000.0", "BUSINESS", "Maximum collection limit allowed for COD bookings", true, null, null));
        defaults.add(new SystemSetting(null, "DELIVERY_RADIUS", "15.0", "BUSINESS", "Maximum radius in km for agent dispatches", true, null, null));
        defaults.add(new SystemSetting(null, "BUSINESS_WORKING_DAYS", "MON,TUE,WED,THU,FRI,SAT", "BUSINESS", "Operating working days of logistics hubs", true, null, null));
        defaults.add(new SystemSetting(null, "BUSINESS_START_TIME", "09:00", "BUSINESS", "Daily operations start window time", true, null, null));
        defaults.add(new SystemSetting(null, "BUSINESS_END_TIME", "20:00", "BUSINESS", "Daily operations end window time", true, null, null));

        // Order
        defaults.add(new SystemSetting(null, "TRACKING_NUMBER_PREFIX", "LM", "ORDERS", "Prefix for unique tracking codes generation", true, null, null));
        defaults.add(new SystemSetting(null, "TRACKING_NUMBER_LENGTH", "14", "ORDERS", "Total character length of tracking code", true, null, null));
        defaults.add(new SystemSetting(null, "DEFAULT_ORDER_STATUS", "ORDER_CREATED", "ORDERS", "Initial status of shipment bookings", true, null, null));
        defaults.add(new SystemSetting(null, "AUTOMATIC_AGENT_ASSIGNMENT", "true", "ORDERS", "Toggle automatic nearest rider assignment", true, null, null));
        defaults.add(new SystemSetting(null, "MAX_DELIVERY_ATTEMPTS", "3", "ORDERS", "Maximum re-attempts allowed for failed runs", true, null, null));
        defaults.add(new SystemSetting(null, "AUTO_CANCEL_PENDING_ORDERS", "false", "ORDERS", "Automatically cancel stale unpicked bookings", true, null, null));
        defaults.add(new SystemSetting(null, "AUTO_COMPLETE_DELIVERED_ORDERS", "true", "ORDERS", "Automatically close delivered shipments", true, null, null));
        defaults.add(new SystemSetting(null, "DEFAULT_PRICING_STRATEGY", "ZONE_WEIGHT", "ORDERS", "Default logic for price calculations", true, null, null));

        // Payments
        String rzpKey = System.getenv("RAZORPAY_KEY") != null ? System.getenv("RAZORPAY_KEY") : "";
        String rzpSecret = System.getenv("RAZORPAY_SECRET") != null ? System.getenv("RAZORPAY_SECRET") : "";
        defaults.add(new SystemSetting(null, "ENABLE_COD", "true", "PAYMENTS", "Enable Cash on Delivery option at checkout", true, null, null));
        defaults.add(new SystemSetting(null, "ENABLE_RAZORPAY", "true", "PAYMENTS", "Enable online payments gateway checkout integration", true, null, null));
        defaults.add(new SystemSetting(null, "RAZORPAY_KEY_ID", rzpKey, "PAYMENTS", "Razorpay checkout public key", true, null, null));
        defaults.add(new SystemSetting(null, "RAZORPAY_KEY_SECRET", rzpSecret, "PAYMENTS", "Razorpay checkout secret key", true, null, null));
        defaults.add(new SystemSetting(null, "REFUND_ENABLED", "true", "PAYMENTS", "Allow transaction refunds processing capabilities", true, null, null));
        defaults.add(new SystemSetting(null, "AUTO_INVOICE_GENERATION", "true", "PAYMENTS", "Automatically print tax invoices upon capture", true, null, null));
        defaults.add(new SystemSetting(null, "INVOICE_PREFIX", "INV", "PAYMENTS", "Tax invoice unique prefix identifier", true, null, null));

        // Email
        String smtpUser = System.getenv("SMTP_USERNAME") != null ? System.getenv("SMTP_USERNAME") : "";
        String smtpPass = System.getenv("SMTP_PASSWORD") != null ? System.getenv("SMTP_PASSWORD") : "";
        defaults.add(new SystemSetting(null, "SMTP_HOST", "smtp.gmail.com", "EMAIL", "SMTP outgoing mail server host name", true, null, null));
        defaults.add(new SystemSetting(null, "SMTP_PORT", "587", "EMAIL", "SMTP outgoing mail server port number", true, null, null));
        defaults.add(new SystemSetting(null, "SMTP_USERNAME", smtpUser, "EMAIL", "SMTP auth credentials account username", true, null, null));
        defaults.add(new SystemSetting(null, "SMTP_PASSWORD", smtpPass, "EMAIL", "SMTP auth credentials account password", true, null, null));
        defaults.add(new SystemSetting(null, "SMTP_AUTHENTICATION", "true", "EMAIL", "Require authenticated SMTP login", true, null, null));
        defaults.add(new SystemSetting(null, "STARTTLS", "true", "EMAIL", "Enable STARTTLS security handshake encryption", true, null, null));
        defaults.add(new SystemSetting(null, "DEFAULT_SENDER_NAME", "LogiTrack Operations", "EMAIL", "Default outgoing email author name", true, null, null));
        defaults.add(new SystemSetting(null, "DEFAULT_SENDER_EMAIL", smtpUser, "EMAIL", "Default outgoing email author address", true, null, null));

        // Notifications
        defaults.add(new SystemSetting(null, "ENABLE_EMAIL_NOTIFS", "true", "NOTIFICATIONS", "Enable system outgoing email dispatches", true, null, null));
        defaults.add(new SystemSetting(null, "ENABLE_PUSH_NOTIFS", "true", "NOTIFICATIONS", "Enable system websocket browser push triggers", true, null, null));
        defaults.add(new SystemSetting(null, "ENABLE_SMS_NOTIFS", "false", "NOTIFICATIONS", "Enable mobile SMS gateway triggers", true, null, null));

        // Tracking
        defaults.add(new SystemSetting(null, "DEFAULT_REFRESH_INTERVAL", "5000", "TRACKING", "Rider tracking GPS polling frequency in ms", true, null, null));
        defaults.add(new SystemSetting(null, "LIVE_TRACKING_ENABLED", "true", "TRACKING", "Allow clients to track active agents on maps", true, null, null));
        defaults.add(new SystemSetting(null, "GPS_ACCURACY_THRESHOLD", "15.0", "TRACKING", "Minimum GPS signal precision accuracy standard", true, null, null));
        defaults.add(new SystemSetting(null, "DEFAULT_ETA_SPEED", "40.0", "TRACKING", "Standard average velocity km/h for ETA Haversine", true, null, null));
        defaults.add(new SystemSetting(null, "MAX_TRACKING_HISTORY", "500", "TRACKING", "Maximum GPS coordinates timeline records stored per order", true, null, null));

        // Security
        defaults.add(new SystemSetting(null, "MIN_PASSWORD_LENGTH", "8", "SECURITY", "Minimum character requirement for login passwords", true, null, null));
        defaults.add(new SystemSetting(null, "REQUIRE_UPPERCASE", "true", "SECURITY", "Enforce uppercase password verification constraints", true, null, null));
        defaults.add(new SystemSetting(null, "REQUIRE_NUMBERS", "true", "SECURITY", "Enforce digit password verification constraints", true, null, null));
        defaults.add(new SystemSetting(null, "REQUIRE_SPECIAL_CHARACTERS", "true", "SECURITY", "Enforce symbol password verification constraints", true, null, null));
        defaults.add(new SystemSetting(null, "JWT_EXPIRATION", "86400000", "SECURITY", "Bearer token validity duration in ms", true, null, null));
        defaults.add(new SystemSetting(null, "REFRESH_TOKEN_EXPIRATION", "604800000", "SECURITY", "Refresh token validity duration in ms", true, null, null));

        // System
        defaults.add(new SystemSetting(null, "APPLICATION_VERSION", "1.0.0", "SYSTEM", "Application core assembly build version", false, null, null));
        defaults.add(new SystemSetting(null, "MAINTENANCE_MODE", "false", "SYSTEM", "Lock server and display offline banner", true, null, null));
        defaults.add(new SystemSetting(null, "DEBUG_LOGGING", "false", "SYSTEM", "Toggle trace diagnostics logger operations", true, null, null));
        defaults.add(new SystemSetting(null, "DEFAULT_PAGINATION_SIZE", "10", "SYSTEM", "Standard page search size returned by API", true, null, null));

        settingRepository.saveAll(defaults);
        refreshCache();
        log.info("System settings defaults seeded and cache initialized.");
    }

    public ApplicationConfigurationResponse getApplicationConfig() {
        return ApplicationConfigurationResponse.builder()
                .configurations(settingsCache)
                .build();
    }
}
