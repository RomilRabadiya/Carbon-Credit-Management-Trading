package com.carboncredit.notificationservice.service;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class NotificationMessagingService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(NotificationMessagingService.class);

    private final SimpMessagingTemplate messagingTemplate;

    public NotificationMessagingService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @SuppressWarnings("null")
    public void sendNotification(String destination, Object payload) {
        log.info("Sending notification to {}: {}", destination, payload);
        messagingTemplate.convertAndSend(destination, payload);
    }
}
