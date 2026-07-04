package com.lastmiletracker.agent.repository;

import com.lastmiletracker.agent.entity.DeliveryAgent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeliveryAgentRepository extends JpaRepository<DeliveryAgent, Long> {

    Optional<DeliveryAgent> findByUserEmail(String email);

    Optional<DeliveryAgent> findByUserId(Long userId);

    List<DeliveryAgent> findByAvailableTrue();

    long countByAvailableTrue();

    long countByAvailableFalse();
}
