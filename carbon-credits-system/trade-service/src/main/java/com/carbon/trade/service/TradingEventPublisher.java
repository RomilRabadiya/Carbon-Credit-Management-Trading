package com.carbon.trade.service;

import com.carbon.trade.event.CreditRetiredEvent;
import com.carbon.trade.event.TradeCompletedEvent;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class TradingEventPublisher {

    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${kafka.topic.trade:trade-topic}")
    private String tradeTopic;

    @Value("${kafka.topic.retirement:retirement-topic}")
    private String retirementTopic;

    public void publishTradeCompleted(TradeCompletedEvent event) {
        try {
            log.info("Publishing TradeCompletedEvent for trade: {}", event.getTradeId());
            kafkaTemplate.send(tradeTopic, event);
        } catch (Exception e) {
            log.error("Failed to publish TradeCompletedEvent", e);
        }
    }

    public void publishCreditRetired(CreditRetiredEvent event) {
        try {
            log.info("Publishing CreditRetiredEvent for credit: {}", event.getCreditId());
            kafkaTemplate.send(retirementTopic, event);
        } catch (Exception e) {
            log.error("Failed to publish CreditRetiredEvent", e);
        }
    }
}
