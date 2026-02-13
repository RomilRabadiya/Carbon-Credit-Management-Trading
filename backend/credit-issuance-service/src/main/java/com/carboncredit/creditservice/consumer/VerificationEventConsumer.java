package com.carboncredit.creditservice.consumer;

import com.carboncredit.common.event.VerificationCompletedEvent;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class VerificationEventConsumer {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(VerificationEventConsumer.class);

    // Legacy consumer, currently unused as issuance is synchronous.
    // Keeping class shell to avoid breaking component scan if needed, or could be
    // deleted.

    @KafkaListener(topics = "${kafka.topic.verification-completed:verification-completed-topic}", groupId = "credit-issuance-group")
    public void handleVerificationCompleted(VerificationCompletedEvent event) {
        log.info("Received VerificationCompletedEvent: {}", event);
        // Logic removed: Credit Issuance is now handled synchronously via API.
        // This listener is kept just to drain the topic if needed, or can be removed.
    }
}
