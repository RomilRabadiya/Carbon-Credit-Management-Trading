package com.carboncredit.tradingservice.consumer;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class CreditIssuedEventConsumer {

    // Legacy consumer, replaced by Feign client calls.

    // @KafkaListener(topics = "${kafka.topic.credit-issued:credit-issued-topic}",
    // groupId = "${spring.kafka.consumer.group-id:trading-service-group}")
    // @Transactional
    // public void consumeCreditIssuedEvent(CreditIssuedEvent event, Acknowledgment
    // ack) {
    // log.info("Received CreditIssuedEvent: {}", event.getSerialNumber());

    // // Check if already exists (Idempotency)
    // if (tradableCreditDAO.existsById(event.getCreditId())) {
    // log.warn("Credit {} already exists in trading DB", event.getCreditId());
    // ack.acknowledge();
    // return;
    // }

    // TradableCredit credit = TradableCredit.builder()
    // .id(event.getCreditId())
    // .serialNumber(event.getSerialNumber())
    // .ownerId(event.getOrganizationId())
    // .amount(event.getCreditAmount())
    // .status("ACTIVE")
    // .build();

    // tradableCreditDAO.save(credit);
    // log.info("Persisted TradableCredit: {}", credit.getSerialNumber());
    // ack.acknowledge();
    // }
}
