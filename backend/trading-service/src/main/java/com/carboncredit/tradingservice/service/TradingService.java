package com.carboncredit.tradingservice.service;

import com.carboncredit.common.event.CreditRetiredEvent;
import com.carboncredit.tradingservice.client.CreditClient;
import com.carboncredit.tradingservice.dao.TradeDAO;
import com.carboncredit.tradingservice.dto.CarbonCreditDTO;
import com.carboncredit.tradingservice.dto.TransactionResponse;
import com.carboncredit.tradingservice.model.Trade;
import com.carboncredit.tradingservice.model.TradeStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class TradingService {

    private final CreditClient creditClient;
    private final TradeDAO tradeDAO;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${kafka.topic.credit-retired:credit-retired-topic}")
    private String creditRetiredTopic;

    /**
     * Retire a credit (Remove from circulation)
     * 
     * Refactored to use Feign Client to check ownership in Credit Service directly.
     * Use "Hybrid" approach: REST for checking, Kafka for Reporting.
     */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    public TransactionResponse retireCredit(Long creditId, Long ownerId) {
        log.info("Attempting to retire credit {} for owner {}", creditId, ownerId);

        // 1. Remote Check via Feign (Sync)
        // This is "logical check". We don't have a local DB of credits anymore in this
        // service.
        CarbonCreditDTO credit = creditClient.getCreditById(creditId);

        if (credit == null) {
            throw new IllegalArgumentException("Credit not found in Credit Service: " + creditId);
        }

        // 2. Validate Ownership
        if (!credit.getOwnerId().equals(ownerId)) {
            log.warn("Unauthorized retirement attempt. Owner: {}, Requester: {}", credit.getOwnerId(), ownerId);
            throw new IllegalStateException("You do not own this credit");
        }

        // 3. Validate Status
        if (!"ACTIVE".equals(credit.getStatus())) {
            log.warn("Invalid credit status for retirement: {}", credit.getStatus());
            throw new IllegalStateException("Credit is not active (Status: " + credit.getStatus() + ")");
        }

        // 4. Record Transaction
        // We still record the "Action" locally, even if we don't own the "Asset"
        // locally.
        Trade trade = Trade.builder()
                .sellerId(ownerId)
                .creditId(creditId)
                .transactionType("RETIRE")
                .status(TradeStatus.COMPLETED)
                .transactionDate(LocalDateTime.now())
                .build();

        Trade savedTrade = tradeDAO.save(trade);
        log.info("Credit {} retirement recorded. Transaction ID: {}", creditId, savedTrade.getId());

        // 5. Publish Event
        // This event will be consumed by Audit Service AND Credit Service (to update
        // status to REMOVED)
        CreditRetiredEvent event = CreditRetiredEvent.builder()
                .creditId(creditId)
                .serialNumber(credit.getSerialNumber())
                .ownerId(ownerId)
                .reason("By Owner Request")
                .transactionId(savedTrade.getId())
                .eventType("CREDIT_RETIRED")
                .build();

        kafkaTemplate.send(creditRetiredTopic, event);

        return new TransactionResponse("Credit retired successfully", savedTrade.getId());
    }
}
