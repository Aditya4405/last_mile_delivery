package com.lastmiletracker.tracking.service;

import com.lastmiletracker.tracking.dto.LiveLocationResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@Slf4j
public class TrackingSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    public TrackingSocketService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Broadcast live location coordinates to subscribed clients (Customer, Admin, Agent)
     */
    public void broadcastLiveLocation(LiveLocationResponse response) {
        // Customer Topic
        messagingTemplate.convertAndSend("/topic/tracking/" + response.getTrackingNumber(), response);
        // Admin Topic
        messagingTemplate.convertAndSend("/topic/admin/live", response);
        // Agent Topic
        messagingTemplate.convertAndSend("/topic/agent/" + response.getAgentId(), response);
        
        log.info("Broadcasted location update over WebSockets for: trackingNumber={}, agentId={}", 
                response.getTrackingNumber(), response.getAgentId());
    }

    /**
     * Broadcast order status changes to subscribed customer and admin
     */
    public void broadcastStatus(String trackingNumber, String status, Long orderId) {
        Map<String, Object> payload = Map.of(
                "orderId", orderId,
                "trackingNumber", trackingNumber,
                "status", status
        );
        messagingTemplate.convertAndSend("/topic/tracking/" + trackingNumber, payload);
        messagingTemplate.convertAndSend("/topic/admin/live", payload);
        
        log.info("Broadcasted status update over WebSockets: trackingNumber={}, status={}", trackingNumber, status);
    }

    /**
     * Broadcast ETA updates to subscribed customer
     */
    public void broadcastETA(String trackingNumber, Integer eta, Long orderId) {
        Map<String, Object> payload = Map.of(
                "orderId", orderId,
                "trackingNumber", trackingNumber,
                "eta", eta
        );
        messagingTemplate.convertAndSend("/topic/tracking/" + trackingNumber, payload);
        
        log.info("Broadcasted ETA update over WebSockets: trackingNumber={}, eta={} mins", trackingNumber, eta);
    }
}
