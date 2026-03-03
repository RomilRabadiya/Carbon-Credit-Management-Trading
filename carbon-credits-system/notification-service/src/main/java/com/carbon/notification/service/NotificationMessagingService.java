package com.carbon.notification.service;

import com.carbon.notification.config.NotificationSocketHandler;
import com.carbon.notification.event.NotificationEvent;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class NotificationMessagingService {

    private static final Logger log = LoggerFactory.getLogger(NotificationMessagingService.class);
    private final NotificationSocketHandler socketHandler;
    private final ObjectMapper objectMapper;

    public NotificationMessagingService(NotificationSocketHandler socketHandler) {
        this.socketHandler = socketHandler;
        this.objectMapper = new ObjectMapper();
        this.objectMapper.registerModule(new JavaTimeModule()); // Needed for LocalDateTime parsing
    }

    public void sendToUser(Long userId, NotificationEvent event) {
        try {
            String jsonPayload = objectMapper.writeValueAsString(event);
            log.info("Pushing event to user {}: {}", userId, jsonPayload);
            socketHandler.sendNotification(userId, jsonPayload);
        } catch (JsonProcessingException e) {
            log.error("Failed to serialize NotificationEvent", e);
        }
    }
}
