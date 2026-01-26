package com.carboncredit.notificationservice.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationMessagingService {

    private final SimpMessagingTemplate messagingTemplate;

    public void sendNotification(String destination, Object payload) {
        log.info("Sending notification to {}: {}", destination, payload);
        messagingTemplate.convertAndSend(destination, payload);
    }
}
