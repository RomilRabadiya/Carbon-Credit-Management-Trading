package com.carbon.notification.listener;

import com.carbon.notification.event.NotificationEvent;
import com.carbon.notification.service.NotificationMessagingService;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class NotificationEventListener {

    private static final Logger log = LoggerFactory.getLogger(NotificationEventListener.class);
    private final NotificationMessagingService messagingService;

    @KafkaListener(topics = "emission-topic", groupId = "notification-group")
    public void handleEmissionReported(@Payload Map<String, Object> eventData) {
        log.info("Received EmissionReportedEvent: {}", eventData);
        // We know from EmissionReportedEvent it contains organizationId which can be
        // mapped to a user role
        // For demonstration, expecting the sender included a targetUserId or we use
        // organizationId as a surrogate
        Long targetUserId = extractId(eventData.get("organizationId"));
        if (targetUserId == null)
            return;

        NotificationEvent notification = NotificationEvent.builder()
                .type("EMISSION_REPORTED")
                .targetUserId(targetUserId)
                .title("Emission Report Submitted")
                .message("Report #" + eventData.get("reportId") + " has been submitted successfully.")
                .timestamp(LocalDateTime.now())
                .data(eventData)
                .build();

        messagingService.sendToUser(targetUserId, notification);
    }

    @KafkaListener(topics = "EMISSION_VERIFIED", groupId = "notification-group")
    public void handleVerificationCompleted(@Payload Map<String, Object> eventData) {
        log.info("Received VerificationCompletedEvent: {}", eventData);
        Long targetUserId = extractId(eventData.get("organizationId"));
        if (targetUserId == null)
            return;

        NotificationEvent notification = NotificationEvent.builder()
                .type("VERIFICATION_COMPLETED")
                .targetUserId(targetUserId)
                .title("Verification Completed")
                .message("Verification for Project #" + eventData.get("projectId") + " is complete.")
                .timestamp(LocalDateTime.now())
                .data(eventData)
                .build();

        messagingService.sendToUser(targetUserId, notification);
    }

    @KafkaListener(topics = "credit-issued-topic", groupId = "notification-group")
    public void handleCreditIssued(@Payload Map<String, Object> eventData) {
        log.info("Received CreditIssuedEvent: {}", eventData);
        Long targetUserId = extractId(eventData.get("organizationId"));
        if (targetUserId == null)
            return;

        NotificationEvent notification = NotificationEvent.builder()
                .type("CREDIT_ISSUED")
                .targetUserId(targetUserId)
                .title("Credits Issued")
                .message(eventData.get("amount") + " credits issued to your wallet.")
                .timestamp(LocalDateTime.now())
                .data(eventData)
                .build();

        messagingService.sendToUser(targetUserId, notification);
    }

    // Helper to safely cast Number map values
    private Long extractId(Object val) {
        if (val instanceof Number)
            return ((Number) val).longValue();
        if (val instanceof String) {
            try {
                return Long.parseLong((String) val);
            } catch (Exception ignored) {
            }
        }
        return null;
    }
}
