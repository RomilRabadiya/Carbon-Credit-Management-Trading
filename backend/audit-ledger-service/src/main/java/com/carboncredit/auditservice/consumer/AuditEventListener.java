package com.carboncredit.auditservice.consumer;

import com.carboncredit.auditservice.dao.AuditDAO;
import com.carboncredit.auditservice.model.AuditRecord;
import com.carboncredit.common.event.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class AuditEventListener {

    private final AuditDAO auditDAO;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "emission-topic", groupId = "audit-service-group")
    public void handleEmissionReported(EmissionReportedEvent event) {
        try {
            // explicit coding for better readability
            String details = objectMapper.writeValueAsString(event);

            AuditRecord record = AuditRecord.builder()
                    .eventType(event.getEventType())
                    .entityId(event.getReportId().toString())
                    .actor(event.getOrganizationId().toString())
                    .details(details)
                    .timestamp(LocalDateTime.now())
                    .build();

            auditDAO.save(record);
            log.info("Audited EMISSION_REPORTED event for report: {}", event.getReportId());
        } catch (Exception e) {
            log.error("Error processing emission event", e);
        }
    }

    @KafkaListener(topics = "EMISSION_VERIFIED", groupId = "audit-service-group")
    public void handleVerificationCompleted(VerificationCompletedEvent event) {
        try {
            String details = objectMapper.writeValueAsString(event);

            AuditRecord record = AuditRecord.builder()
                    .eventType("VERIFICATION_COMPLETED")
                    .entityId(event.getVerificationId().toString())
                    .actor(event.getVerifierId().toString())
                    .details(details)
                    .timestamp(LocalDateTime.now())
                    .build();

            auditDAO.save(record);
            log.info("Audited VERIFICATION_COMPLETED event for verification: {}", event.getVerificationId());
        } catch (Exception e) {
            log.error("Error processing verification event", e);
        }
    }

    @KafkaListener(topics = "credit-issued-topic", groupId = "audit-service-group")
    public void handleCreditIssued(CreditIssuedEvent event) {
        try {
            String details = objectMapper.writeValueAsString(event);

            AuditRecord record = AuditRecord.builder()
                    .eventType(event.getEventType())
                    .entityId(event.getCreditId().toString())
                    .serialNumber(event.getSerialNumber())
                    .actor(event.getOrganizationId().toString())
                    .details(details)
                    .timestamp(LocalDateTime.now())
                    .build();

            auditDAO.save(record);
            log.info("Audited CREDIT_ISSUED event for credit: {}", event.getCreditId());
        } catch (Exception e) {
            log.error("Error processing credit issuance event", e);
        }
    }

    @KafkaListener(topics = "credit-retired-topic", groupId = "audit-service-group")
    public void handleCreditRetired(CreditRetiredEvent event) {
        try {
            String details = objectMapper.writeValueAsString(event);

            AuditRecord record = AuditRecord.builder()
                    .eventType(event.getEventType())
                    .entityId(event.getCreditId().toString())
                    .serialNumber(event.getSerialNumber())
                    .actor(event.getOwnerId().toString())
                    .details(details)
                    .timestamp(LocalDateTime.now())
                    .build();

            auditDAO.save(record);
            log.info("Audited CREDIT_RETIRED event for credit: {}", event.getCreditId());
        } catch (Exception e) {
            log.error("Error processing credit retirement event", e);
        }
    }

    @KafkaListener(topics = "trade-completed-topic", groupId = "audit-service-group")
    public void handleTradeCompleted(com.carboncredit.common.event.TradeCompletedEvent event) {
        try {
            String details = objectMapper.writeValueAsString(event);
            String actor = "Seller:" + event.getSellerId() + ">Buyer:" + event.getBuyerId();

            AuditRecord record = AuditRecord.builder()
                    .eventType("TRADE_COMPLETED")
                    .entityId(event.getCreditId().toString())
                    .actor(actor)
                    .details(details)
                    .timestamp(LocalDateTime.now())
                    .build();

            auditDAO.save(record);
            log.info("Audited TRADE_COMPLETED event for credit: {}", event.getCreditId());
        } catch (Exception e) {
            log.error("Error processing trade event", e);
        }
    }
}
