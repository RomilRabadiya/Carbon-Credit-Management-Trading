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
        String reportId = extractString(event.get("id"));

        AuditLog logEntry = AuditLog.builder()
                .transactionId(UUID.randomUUID().toString())
                .transactionType("EMISSION_REPORTED")
                .sourceOrganizationId(orgId)
                .status("COMPLETED")
                .remarks("Emission Report submitted. Report ID: " + reportId)
                .build();
                
        auditLogRepository.save(logEntry);
    }

    @KafkaListener(topics = "EMISSION_VERIFIED", groupId = "audit-group")
    public void handleEmissionVerified(Map<String, Object> event) {
        log.info("Received EMISSION_VERIFIED event: {}", event);
        
        Long orgId = extractLong(event.get("organizationId"));
        String verificationId = extractString(event.get("id"));
        
        AuditLog logEntry = AuditLog.builder()
                .transactionId(UUID.randomUUID().toString())
                .transactionType("VERIFICATION_COMPLETED")
                .sourceOrganizationId(orgId)
                .status(extractString(event.get("status")))
                .remarks("Verification processed. ID: " + verificationId + ", Remarks: " + extractString(event.get("remarks")))
                .build();
                
        auditLogRepository.save(logEntry);
    }

    @KafkaListener(topics = "credit-issued-topic", groupId = "audit-group")
    public void handleCreditIssued(Map<String, Object> event) {
        log.info("Received credit-issued-topic event: {}", event);
        
        Long orgId = extractLong(event.get("organizationId"));
        BigDecimal amount = extractBigDecimal(event.get("amount"));
        String creditId = extractString(event.get("id"));

        // 1. Audit Log 
        AuditLog logEntry = AuditLog.builder()
                .transactionId("CREDIT_" + creditId)
                .transactionType("CREDIT_ISSUED")
                .destinationOrganizationId(orgId)
                .creditAmount(amount)
                .status("COMPLETED")
                .remarks("Carbon Credits minted and assigned to Organization")
                .build();
        auditLogRepository.save(logEntry);

        // 2. Financial Ledger Entry
        LedgerEntry ledgerEntry = LedgerEntry.builder()
                .organizationId(orgId)
                .credit(amount)
                .debit(BigDecimal.ZERO)
                .description("Platform issuance for verified emissions")
                .reference("CREDIT_ID_" + creditId)
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
