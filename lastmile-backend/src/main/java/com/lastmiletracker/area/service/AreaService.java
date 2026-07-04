package com.lastmiletracker.area.service;

import com.lastmiletracker.area.dto.AreaRequest;
import com.lastmiletracker.area.dto.AreaResponse;
import com.lastmiletracker.area.entity.Area;
import com.lastmiletracker.area.mapper.AreaMapper;
import com.lastmiletracker.area.repository.AreaRepository;
import com.lastmiletracker.exception.DuplicateResourceException;
import com.lastmiletracker.exception.ResourceNotFoundException;
import com.lastmiletracker.zone.entity.Zone;
import com.lastmiletracker.zone.repository.ZoneRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Slf4j
public class AreaService {

    private final AreaRepository areaRepository;
    private final ZoneRepository zoneRepository;
    private final AreaMapper areaMapper;

    public AreaService(
            AreaRepository areaRepository,
            ZoneRepository zoneRepository,
            AreaMapper areaMapper) {
        this.areaRepository = areaRepository;
        this.zoneRepository = zoneRepository;
        this.areaMapper = areaMapper;
    }

    @Transactional(readOnly = true)
    public List<AreaResponse> getAllAreas() {
        return areaRepository.findAll().stream()
                .map(areaMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AreaResponse getAreaById(Long id) {
        Area area = areaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Area not found with id: " + id));
        return areaMapper.toResponse(area);
    }

    @Transactional
    public AreaResponse createArea(AreaRequest request) {
        Zone zone = zoneRepository.findById(request.getZoneId())
                .orElseThrow(() -> new ResourceNotFoundException("Zone not found with id: " + request.getZoneId()));

        if (areaRepository.findByName(request.getName()).isPresent()) {
            throw new DuplicateResourceException("Area with name '" + request.getName() + "' already exists");
        }

        if (areaRepository.findByPincode(request.getPincode()).isPresent()) {
            throw new DuplicateResourceException("Area with pincode '" + request.getPincode() + "' already exists");
        }

        Area area = Area.builder()
                .name(request.getName())
                .pincode(request.getPincode())
                .zone(zone)
                .build();

        Area savedArea = areaRepository.save(area);
        log.info("New area created: {} with pincode {}", savedArea.getName(), savedArea.getPincode());
        return areaMapper.toResponse(savedArea);
    }

    @Transactional
    public AreaResponse updateArea(Long id, AreaRequest request) {
        Area area = areaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Area not found with id: " + id));

        Zone zone = zoneRepository.findById(request.getZoneId())
                .orElseThrow(() -> new ResourceNotFoundException("Zone not found with id: " + request.getZoneId()));

        Optional<Area> existingByName = areaRepository.findByName(request.getName());
        if (existingByName.isPresent() && !existingByName.get().getId().equals(id)) {
            throw new DuplicateResourceException("Area with name '" + request.getName() + "' already exists");
        }

        Optional<Area> existingByPincode = areaRepository.findByPincode(request.getPincode());
        if (existingByPincode.isPresent() && !existingByPincode.get().getId().equals(id)) {
            throw new DuplicateResourceException("Area with pincode '" + request.getPincode() + "' already exists");
        }

        area.setName(request.getName());
        area.setPincode(request.getPincode());
        area.setZone(zone);

        Area updatedArea = areaRepository.save(area);
        log.info("Area updated: {} with pincode {}", updatedArea.getName(), updatedArea.getPincode());
        return areaMapper.toResponse(updatedArea);
    }

    @Transactional
    public void deleteArea(Long id) {
        Area area = areaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Area not found with id: " + id));
        areaRepository.delete(area);
        log.info("Area deleted: {}", area.getName());
    }
}
