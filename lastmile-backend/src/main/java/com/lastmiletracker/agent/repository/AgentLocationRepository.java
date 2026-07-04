package com.lastmiletracker.agent.repository;

import com.lastmiletracker.agent.entity.AgentLocation;
import com.lastmiletracker.agent.entity.DeliveryAgent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AgentLocationRepository extends JpaRepository<AgentLocation, Long> {

    Optional<AgentLocation> findByAgentId(Long agentId);

    Optional<AgentLocation> findByAgent(DeliveryAgent agent);
}
