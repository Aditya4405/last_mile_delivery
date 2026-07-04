package com.lastmiletracker.notification.repository;

import com.lastmiletracker.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserEmailOrderByCreatedAtDesc(String email);

    List<Notification> findByUserEmailAndReadStatusFalseOrderByCreatedAtDesc(String email);
}
