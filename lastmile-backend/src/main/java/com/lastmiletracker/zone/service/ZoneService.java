package com.lastmiletracker.zone.service;

import com.lastmiletracker.area.entity.Area;
import com.lastmiletracker.area.repository.AreaRepository;
import com.lastmiletracker.exception.DuplicateResourceException;
import com.lastmiletracker.exception.ResourceNotFoundException;
import com.lastmiletracker.zone.dto.ZoneRequest;
import com.lastmiletracker.zone.dto.ZoneResponse;
import com.lastmiletracker.zone.entity.Zone;
import com.lastmiletracker.zone.mapper.ZoneMapper;
import com.lastmiletracker.zone.repository.ZoneRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
public class ZoneService {

    private final ZoneRepository zoneRepository;
    private final AreaRepository areaRepository;
    private final ZoneMapper zoneMapper;

    public ZoneService(
            ZoneRepository zoneRepository,
            @Lazy AreaRepository areaRepository,
            ZoneMapper zoneMapper) {
        this.zoneRepository = zoneRepository;
        this.areaRepository = areaRepository;
        this.zoneMapper = zoneMapper;
    }

    @Transactional(readOnly = true)
    public List<ZoneResponse> getAllZones() {
        return zoneRepository.findAll().stream()
                .map(zoneMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ZoneResponse getZoneById(Long id) {
        Zone zone = zoneRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Zone not found with id: " + id));
        return zoneMapper.toResponse(zone);
    }

    @Transactional
    public ZoneResponse createZone(ZoneRequest request) {
        if (zoneRepository.findByName(request.getName()).isPresent()) {
            throw new DuplicateResourceException("Zone with name '" + request.getName() + "' already exists");
        }
        Zone zone = zoneMapper.toEntity(request);
        Zone savedZone = zoneRepository.save(zone);
        log.info("New zone created: {}", savedZone.getName());
        return zoneMapper.toResponse(savedZone);
    }

    @Transactional
    public ZoneResponse updateZone(Long id, ZoneRequest request) {
        Zone zone = zoneRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Zone not found with id: " + id));

        Optional<Zone> existingZone = zoneRepository.findByName(request.getName());
        if (existingZone.isPresent() && !existingZone.get().getId().equals(id)) {
            throw new DuplicateResourceException("Zone with name '" + request.getName() + "' already exists");
        }

        zoneMapper.updateEntityFromRequest(request, zone);
        Zone updatedZone = zoneRepository.save(zone);
        log.info("Zone updated: {}", updatedZone.getName());
        return zoneMapper.toResponse(updatedZone);
    }

    @Transactional
    public void deleteZone(Long id) {
        Zone zone = zoneRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Zone not found with id: " + id));
        zoneRepository.delete(zone);
        log.info("Zone deleted: {}", zone.getName());
    }

    @Transactional(readOnly = true)
    public ZoneResponse detectZone(String pincode, Double latitude, Double longitude) {
        // 1. Try resolving via Pincode first (Area mapping)
        if (pincode != null && !pincode.isBlank()) {
            Optional<Area> areaOpt = areaRepository.findByPincode(pincode.trim());
            if (areaOpt.isPresent()) {
                Zone zone = areaOpt.get().getZone();
                log.info("Zone detected by pincode {}: {}", pincode, zone.getName());
                return zoneMapper.toResponse(zone);
            }
        }

        // 2. Fallback to GPS coordinates (Bounding boxes for major Indian regions)
        if (latitude != null && longitude != null) {
            // Noida Central Box: lat [28.50, 28.66], lng [77.29, 77.44]
            if (latitude >= 28.50 && latitude <= 28.66 && longitude >= 77.29 && longitude <= 77.44) {
                return findZoneByName("Noida");
            }
            // South Delhi Box: lat [28.45, 28.58], lng [77.15, 77.28]
            if (latitude >= 28.45 && latitude <= 28.58 && longitude >= 77.15 && longitude <= 77.28) {
                return findZoneByName("South Delhi");
            }
            // North Delhi Box: lat [28.65, 28.80], lng [77.05, 77.22]
            if (latitude >= 28.65 && latitude <= 28.80 && longitude >= 77.05 && longitude <= 77.22) {
                return findZoneByName("North Delhi");
            }
        }

        // 3. Fallback to default first zone if nothing matches, or throw error
        List<Zone> zones = zoneRepository.findAll();
        if (!zones.isEmpty()) {
            log.warn("Undetected location (pincode: {}, lat: {}, lng: {}). Defaulting to first zone.", pincode, latitude, longitude);
            return zoneMapper.toResponse(zones.getFirst());
        }

        throw new ResourceNotFoundException("No zones configured in the system to detect matching location");
    }

    private ZoneResponse findZoneByName(String name) {
        return zoneRepository.findByName(name)
                .map(zoneMapper::toResponse)
                .orElseGet(() -> {
                    // If named zone is not in DB, fallback to first zone
                    List<Zone> zones = zoneRepository.findAll();
                    if (!zones.isEmpty()) {
                        return zoneMapper.toResponse(zones.getFirst());
                    }
                    throw new ResourceNotFoundException("Zone '" + name + "' not found and no fallback zones exist");
                });
    }
}
