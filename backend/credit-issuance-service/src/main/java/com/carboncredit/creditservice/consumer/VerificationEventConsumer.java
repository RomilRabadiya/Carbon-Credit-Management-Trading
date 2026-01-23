package com.carboncredit.creditservice.consumer;

import com.carboncredit.common.event.VerificationCompletedEvent;
import com.carboncredit.creditservice.service.CreditIssuanceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class VerificationEventConsumer {

    private final CreditIssuanceService creditIssuanceService;

    @KafkaListener(topics = "${kafka.topic.verification-completed:verification-completed-topic}", groupId = "credit-issuance-group")
    public void handleVerificationCompleted(VerificationCompletedEvent event) {
        log.info("Received VerificationCompletedEvent: {}", event);
        creditIssuanceService.processVerificationEvent(event);
    }
}
