package com.carbon.audit.listener;

import com.carbon.audit.entity.AuditLog;
import com.carbon.audit.entity.LedgerEntry;
import com.carbon.audit.repository.AuditLogRepository;
import com.carbon.audit.repository.LedgerEntryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@Component
@Slf4j
@RequiredArgsConstructor
public class AuditEventListener {

    private final AuditLogRepository auditLogRepository;
    private final LedgerEntryRepository ledgerEntryRepository;

    @KafkaListener(topics = "emission-topic", groupId = "audit-group")
    public void handleEmissionReported(Map<String, Object> event) {
        log.info("Received emission-topic event: {}", event);
        
        Long orgId = extractLong(event.get("organizationId"));
        String reportId = extractString(event.get("reportId"));
        BigDecimal amount = extractBigDecimal(event.get("carbonAmount"));

        AuditLog logEntry = AuditLog.builder()
                .transactionId("EMISSION_" + (reportId.isEmpty() ? UUID.randomUUID().toString() : reportId))
                .transactionType("EMISSION_REPORTED")
                .sourceOrganizationId(orgId)
                .creditAmount(amount)
                .status("COMPLETED")
                .remarks("Emission Report submitted. Amount: " + amount + " tCO2e. Report ID: " + reportId)
                .build();
                
        auditLogRepository.save(logEntry);
        log.info("Saved EMISSION_REPORTED audit log for org {}", orgId);
    }

    @KafkaListener(topics = "EMISSION_VERIFIED", groupId = "audit-group")
    public void handleEmissionVerified(Map<String, Object> event) {
        log.info("Received EMISSION_VERIFIED event: {}", event);
        
        Long orgId = extractLong(event.get("organizationId"));
        String verificationId = extractString(event.get("verificationId"));
        BigDecimal amount = extractBigDecimal(event.get("carbonCreditsCalculated"));
        
        AuditLog logEntry = AuditLog.builder()
                .transactionId("VERIFY_" + (verificationId.isEmpty() ? UUID.randomUUID().toString() : verificationId))
                .transactionType("VERIFICATION_COMPLETED")
                .sourceOrganizationId(orgId)
                .creditAmount(amount)
                .status(extractString(event.get("status")))
                .remarks("Verification processed. Status: " + extractString(event.get("status")) + ", Credits: " + amount + ", Remarks: " + extractString(event.get("remarks")))
                .build();
                
        auditLogRepository.save(logEntry);
        log.info("Saved VERIFICATION_COMPLETED audit log for org {}", orgId);
    }

    @KafkaListener(topics = "credit-issued-topic", groupId = "audit-group")
    public void handleCreditIssued(Map<String, Object> event) {
        log.info("Received credit-issued-topic event: {}", event);
        
        Long orgId = extractLong(event.get("organizationId"));
        BigDecimal amount = extractBigDecimal(event.get("creditAmount"));
        String creditId = extractString(event.get("creditId"));

        // 1. Audit Log 
        AuditLog logEntry = AuditLog.builder()
                .transactionId("CREDIT_" + (creditId.isEmpty() ? UUID.randomUUID().toString() : creditId))
                .transactionType("CREDIT_ISSUED")
                .destinationOrganizationId(orgId)
                .creditAmount(amount)
                .status("COMPLETED")
                .remarks("Carbon Credits minted and assigned to Organization. Amount: " + amount)
                .build();
        auditLogRepository.save(logEntry);
        log.info("Saved CREDIT_ISSUED audit log for org {}", orgId);

        // 2. Financial Ledger Entry
        LedgerEntry ledgerEntry = LedgerEntry.builder()
                .organizationId(orgId)
                .credit(amount)
                .debit(BigDecimal.ZERO)
                .description("Platform issuance for verified emissions")
                .reference("CREDIT_ID_" + creditId)
                .build();
        ledgerEntryRepository.save(ledgerEntry);
        log.info("Saved Ledger Entry for org {}", orgId);
    }

    @KafkaListener(topics = "trade-topic", groupId = "audit-group")
    public void handleTradeCompleted(Map<String, Object> event) {
        log.info("Received trade-topic event: {}", event);

        Long sellerId = extractLong(event.get("sellerId"));
        Long buyerId = extractLong(event.get("buyerId"));
        BigDecimal amount = extractBigDecimal(event.get("creditAmount"));
        BigDecimal price = extractBigDecimal(event.get("pricePerUnit"));
        String tradeId = extractString(event.get("tradeId"));
        String creditId = extractString(event.get("creditId"));

        // 1. Audit Log
        AuditLog logEntry = AuditLog.builder()
                .transactionId("TRADE_" + (tradeId.isEmpty() ? UUID.randomUUID().toString() : tradeId))
                .transactionType("TRADE")
                .sourceOrganizationId(sellerId)
                .destinationOrganizationId(buyerId)
                .creditAmount(amount)
                .status("COMPLETED")
                .remarks("Credit traded between organizations. Credit ID: " + creditId + ", Price: " + price)
                .build();
        auditLogRepository.save(logEntry);
        log.info("Saved TRADE audit log for seller {} and buyer {}", sellerId, buyerId);

        // 2. Ledger Entries (Double entry)
        // Seller gets a debit of carbon credits (balance decreases)
        LedgerEntry sellerEntry = LedgerEntry.builder()
                .organizationId(sellerId)
                .credit(BigDecimal.ZERO)
                .debit(amount)
                .description("Carbon Credit sale to Org " + buyerId)
                .reference("TRADE_" + tradeId)
                .build();
        ledgerEntryRepository.save(sellerEntry);

        // Buyer gets a credit of carbon credits (balance increases)
        LedgerEntry buyerEntry = LedgerEntry.builder()
                .organizationId(buyerId)
                .credit(amount)
                .debit(BigDecimal.ZERO)
                .description("Carbon Credit purchase from Org " + sellerId)
                .reference("TRADE_" + tradeId)
                .build();
        ledgerEntryRepository.save(buyerEntry);
    }

    @KafkaListener(topics = "retirement-topic", groupId = "audit-group")
    public void handleCreditRetired(Map<String, Object> event) {
        log.info("Received retirement-topic event: {}", event);

        Long orgId = extractLong(event.get("organizationId"));
        BigDecimal amount = extractBigDecimal(event.get("creditAmount"));
        String creditId = extractString(event.get("creditId"));

        // 1. Audit Log
        AuditLog logEntry = AuditLog.builder()
                .transactionId("RETIRE_" + (creditId.isEmpty() ? UUID.randomUUID().toString() : creditId) + "_" + System.currentTimeMillis())
                .transactionType("RETIRED")
                .sourceOrganizationId(orgId)
                .creditAmount(amount)
                .status("COMPLETED")
                .remarks("Credit retired for compliance. Beneficiary: " + extractString(event.get("beneficiary")) + ", Reason: " + extractString(event.get("reason")))
                .build();
        auditLogRepository.save(logEntry);
        log.info("Saved RETIRE audit log for org {}", orgId);

        // 2. Ledger Entry (Deduct credits)
        LedgerEntry ledgerEntry = LedgerEntry.builder()
                .organizationId(orgId)
                .credit(BigDecimal.ZERO)
                .debit(amount)
                .description("Carbon Credit retirement for compliance")
                .reference("RETIRE_CREDIT_" + creditId)
                .build();
        ledgerEntryRepository.save(ledgerEntry);
    }

    // Helper functions for parsing Kafka JSON Maps safely
    private Long extractLong(Object obj) {
        if (obj == null) return null;
        if (obj instanceof Number) return ((Number) obj).longValue();
        try { return Long.parseLong(obj.toString()); } catch (Exception e) { return null; }
    }
    
    private BigDecimal extractBigDecimal(Object obj) {
        if (obj == null) return BigDecimal.ZERO;
        try { return new BigDecimal(obj.toString()); } catch (Exception e) { return BigDecimal.ZERO; }
    }
    
    private String extractString(Object obj) {
        return obj == null ? "" : obj.toString();
    }
}
