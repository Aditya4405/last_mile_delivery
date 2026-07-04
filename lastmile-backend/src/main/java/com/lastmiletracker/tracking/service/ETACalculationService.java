package com.lastmiletracker.tracking.service;

import com.lastmiletracker.area.entity.Area;
import com.lastmiletracker.area.repository.AreaRepository;
import com.lastmiletracker.util.LocationUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@Slf4j
public class ETACalculationService {

    private final AreaRepository areaRepository;
    private final com.lastmiletracker.setting.service.SystemSettingService systemSettingService;

    public ETACalculationService(
            AreaRepository areaRepository,
            com.lastmiletracker.setting.service.SystemSettingService systemSettingService) {
        this.areaRepository = areaRepository;
        this.systemSettingService = systemSettingService;
    }

    /**
     * Resolve delivery destination coordinates from postal code
     */
    public double[] getDeliveryCoordinates(String pincode) {
        double lat = 28.5355; // Default fallback coordinates (Noida)
        double lng = 77.3910;

        Optional<Area> areaOpt = areaRepository.findByPincode(pincode);
        if (areaOpt.isPresent()) {
            String areaName = areaOpt.get().getName().toLowerCase();
            if (areaName.contains("delhi south") || areaName.contains("south delhi")) {
                lat = 28.5672;
                lng = 77.2190;
            } else if (areaName.contains("delhi north") || areaName.contains("north delhi")) {
                lat = 28.6800;
                lng = 77.1200;
            } else if (areaName.contains("gurgaon") || areaName.contains("gurugram")) {
                lat = 28.4595;
                lng = 77.0266;
            }
        }
        return new double[]{lat, lng};
    }

    /**
     * Compute estimated time of arrival (ETA) in minutes
     */
    public int calculateETA(double agentLat, double agentLng, Double speed, String deliveryPincode) {
        double[] deliveryCoords = getDeliveryCoordinates(deliveryPincode);
        double distance = LocationUtils.calculateDistance(agentLat, agentLng, deliveryCoords[0], deliveryCoords[1]);
        
        double defaultSpeed = systemSettingService.getSettingAsDouble("DEFAULT_ETA_SPEED", 40.0);
        double speedKmh = (speed != null && speed > 0.0) ? speed : defaultSpeed; // Default average speed
        double timeHours = distance / speedKmh;
        int timeMinutes = (int) Math.round(timeHours * 60.0);
        
        log.debug("ETA calculated: distance={} km, speed={} km/h, eta={} mins", distance, speedKmh, timeMinutes);
        return Math.max(1, timeMinutes); // Fallback to 1 minute minimum
    }
}
