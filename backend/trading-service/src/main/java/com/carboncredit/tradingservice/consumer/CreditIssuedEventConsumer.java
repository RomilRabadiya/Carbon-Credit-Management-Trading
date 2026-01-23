package com.carboncredit.tradingservice.consumer;

import com.carboncredit.common.event.CreditIssuedEvent;
import com.carboncredit.tradingservice.dao.TradableCreditDAO;
import com.carboncredit.tradingservice.model.TradableCredit;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
@Slf4j
public class CreditIssuedEventConsumer {

    private final TradableCreditDAO tradableCreditDAO;

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
