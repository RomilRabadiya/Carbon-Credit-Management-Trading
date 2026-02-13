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

    @KafkaListener(topics = "${kafka.topic.emission-reported:emission-topic}", groupId = "audit-service-group")
    public void handleEmissionReported(EmissionReportedEvent event) {
        saveAudit(event.getEventType(), event.getReportId().toString(), null, event,
                event.getOrganizationId().toString());
    }

    @KafkaListener(topics = "${kafka.topic.verification-completed:verification-completed-topic}", groupId = "audit-service-group")
    public void handleVerificationCompleted(VerificationCompletedEvent event) {
        saveAudit("VERIFICATION_COMPLETED", event.getVerificationId().toString(), null, event,
                event.getVerifierId().toString());
    }

    @KafkaListener(topics = "${kafka.topic.credit-issued:credit-issued-topic}", groupId = "audit-service-group")
    public void handleCreditIssued(CreditIssuedEvent event) {
        saveAudit(event.getEventType(), event.getCreditId().toString(), event.getSerialNumber(), event,
                event.getOrganizationId().toString());
    }

    @KafkaListener(topics = "${kafka.topic.credit-retired:credit-retired-topic}", groupId = "audit-service-group")
    public void handleCreditRetired(CreditRetiredEvent event) {
        saveAudit(event.getEventType(), event.getCreditId().toString(), event.getSerialNumber(), event,
                event.getOwnerId().toString());
    }

    @KafkaListener(topics = "${kafka.topic.trade-completed:trade-completed-topic}", groupId = "audit-service-group")
    public void handleTradeCompleted(com.carboncredit.common.event.TradeCompletedEvent event) {
        saveAudit("TRADE_COMPLETED", event.getCreditId().toString(), null, event,
                "Seller:" + event.getSellerId() + ">Buyer:" + event.getBuyerId());
    }

    @SuppressWarnings("null")
    private void saveAudit(String eventType, String entityId, String serialNumber, Object payload, String actor) {
        try {
            String details = objectMapper.writeValueAsString(payload);
            AuditRecord record = AuditRecord.builder()
                    .eventType(eventType)
                    .entityId(entityId)
                    .serialNumber(serialNumber)
                    .details(details)
                    .actor(actor)
                    .timestamp(LocalDateTime.now())
                    .build();
            auditDAO.save(record);
            log.info("Audited event: {} for entity: {}", eventType, entityId);
        } catch (Exception e) {
            log.error("Failed to save audit record", e);
        }
    }
}
