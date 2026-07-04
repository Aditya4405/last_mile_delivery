package com.lastmiletracker.area.repository;

import com.lastmiletracker.area.entity.Area;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AreaRepository extends JpaRepository<Area, Long> {

    Optional<Area> findByPincode(String pincode);

    Optional<Area> findByName(String name);

    List<Area> findByZoneId(Long zoneId);
}
