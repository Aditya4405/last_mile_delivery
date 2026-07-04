package com.lastmiletracker.tracking.repository;

import com.lastmiletracker.tracking.entity.TrackingHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrackingHistoryRepository extends JpaRepository<TrackingHistory, Long> {

    List<TrackingHistory> findByOrderIdOrderByUpdatedAtAsc(Long orderId);

    List<TrackingHistory> findByOrderTrackingNumberOrderByUpdatedAtAsc(String trackingNumber);
}
