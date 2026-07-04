package com.lastmiletracker.notification.service;

import com.lastmiletracker.exception.ResourceNotFoundException;
import com.lastmiletracker.notification.dto.NotificationResponse;
import com.lastmiletracker.notification.entity.Notification;
import com.lastmiletracker.notification.repository.NotificationRepository;
import com.lastmiletracker.user.entity.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final JavaMailSender mailSender;

    public NotificationService(NotificationRepository notificationRepository, JavaMailSender mailSender) {
        this.notificationRepository = notificationRepository;
        this.mailSender = mailSender;
    }

    @Transactional
    public void sendNotification(User user, String title, String messageContent) {
        Notification notification = Notification.builder()
                .user(user)
                .title(title)
                .message(messageContent)
                .readStatus(false)
                .build();
        notificationRepository.save(notification);

        log.info(">>>> [SYSTEM NOTIFICATION] User={}: [{}] - {}", user.getEmail(), title, messageContent);

        // Try dispatching an email notification
        sendEmail(user.getEmail(), title, messageContent);
    }

    @Transactional(readOnly = true)
    public List<NotificationResponse> getUserNotifications(String email, Boolean unreadOnly) {
        List<Notification> notifications;
        if (unreadOnly != null && unreadOnly) {
            notifications = notificationRepository.findByUserEmailAndReadStatusFalseOrderByCreatedAtDesc(email);
        } else {
            notifications = notificationRepository.findByUserEmailOrderByCreatedAtDesc(email);
        }

        return notifications.stream()
                .map(n -> NotificationResponse.builder()
                        .id(n.getId())
                        .title(n.getTitle())
                        .message(n.getMessage())
                        .readStatus(n.isReadStatus())
                        .createdAt(n.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public void markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));
        notification.setReadStatus(true);
        notificationRepository.save(notification);
        log.debug("Notification {} marked as read", id);
    }

    @Transactional
    public void markAllAsRead(String email) {
        List<Notification> unread = notificationRepository.findByUserEmailAndReadStatusFalseOrderByCreatedAtDesc(email);
        for (Notification n : unread) {
            n.setReadStatus(true);
        }
        notificationRepository.saveAll(unread);
        log.info("All notifications marked as read for user {}", email);
    }

    private void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            log.debug("Email notification successfully sent to {}", to);
        } catch (Exception e) {
            log.warn("Failed to dispatch email notification to {}: {}", to, e.getMessage());
        }
    }
}
