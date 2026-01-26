package com.carboncredit.notificationservice.listener;

import com.carboncredit.notificationservice.event.CreditIssuedEvent;
import com.carboncredit.notificationservice.event.EmissionReportedEvent;
import com.carboncredit.notificationservice.event.VerificationCompletedEvent;
import com.carboncredit.notificationservice.service.NotificationMessagingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class NotificationEventListener {

    private final NotificationMessagingService messagingService;

    @KafkaListener(topics = "emission-topic", groupId = "notification-service-group")
    public void handleEmissionReported(EmissionReportedEvent event) {
        log.info("Received EmissionReportedEvent: {}", event);
        // Push to public topic or specific user
        messagingService.sendNotification("/topic/emissions", event);
    }

    @KafkaListener(topics = "EMISSION_VERIFIED", groupId = "notification-service-group")
    public void handleVerificationCompleted(VerificationCompletedEvent event) {
        log.info("Received VerificationCompletedEvent: {}", event);
        messagingService.sendNotification("/topic/verifications", event);
    }

    @KafkaListener(topics = "credit-issued-topic", groupId = "notification-service-group")
    public void handleCreditIssued(CreditIssuedEvent event) {
        log.info("Received CreditIssuedEvent: {}", event);
        messagingService.sendNotification("/topic/credits", event);
    }
}
