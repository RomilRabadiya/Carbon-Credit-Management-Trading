package com.carbon.audit.controller;

import com.carbon.audit.entity.AuditLog;
import com.carbon.audit.entity.LedgerEntry;
import com.carbon.audit.repository.AuditLogRepository;
import com.carbon.audit.repository.LedgerEntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
public class AuditController {

    private final AuditLogRepository auditLogRepository;
    private final LedgerEntryRepository ledgerEntryRepository;

    @GetMapping("/logs")
    public ResponseEntity<List<AuditLog>> getAllLogs() {
        return ResponseEntity.ok(auditLogRepository.findAll());
    }

    @GetMapping("/logs/organization/{orgId}")
    public ResponseEntity<List<AuditLog>> getLogsByOrgId(@PathVariable Long orgId) {
        return ResponseEntity.ok(auditLogRepository.findBySourceOrganizationIdOrDestinationOrganizationIdOrderByTimestampDesc(orgId, orgId));
    }

    @GetMapping("/ledger/organization/{orgId}")
    public ResponseEntity<List<LedgerEntry>> getLedgerByOrgId(@PathVariable Long orgId) {
        return ResponseEntity.ok(ledgerEntryRepository.findByOrganizationIdOrderByEntryDateDesc(orgId));
    }

    @GetMapping("/transactions/me")
    public ResponseEntity<Map<String, Object>> getTransactions(
            @RequestParam(required = false) Long orgId,
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int pageSize) {
        
        if (orgId == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "orgId is required"));
        }

        List<AuditLog> allLogs = auditLogRepository.findBySourceOrganizationIdOrDestinationOrganizationIdOrderByTimestampDesc(orgId, orgId);
        
        // Simple filtering in memory for now
        List<AuditLog> filteredLogs = allLogs.stream()
            .filter(log -> type == null || log.getTransactionType().equals(type))
            .filter(log -> status == null || log.getStatus().equals(status))
            .filter(log -> search == null || search.isEmpty() || 
                    log.getTransactionId().contains(search) || 
                    (log.getRemarks() != null && log.getRemarks().contains(search)))
            .collect(Collectors.toList());

        // Simple pagination
        int total = filteredLogs.size();
        int start = Math.min((page - 1) * pageSize, total);
        int end = Math.min(start + pageSize, total);
        List<AuditLog> pagedLogs = filteredLogs.subList(start, end);

        return ResponseEntity.ok(Map.of(
            "data", pagedLogs,
            "pagination", Map.of(
                "total", total,
                "page", page,
                "pageSize", pageSize
            )
        ));
    }

    @GetMapping("/transactions/stats")
    public ResponseEntity<Map<String, Object>> getStats(@RequestParam(required = false) Long orgId) {
        if (orgId == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "orgId is required"));
        }

        List<AuditLog> logs = auditLogRepository.findBySourceOrganizationIdOrDestinationOrganizationIdOrderByTimestampDesc(orgId, orgId);
        
        long totalTransactions = logs.size();
        BigDecimal totalValue = BigDecimal.ZERO;
        long creditsTraded = 0;
        long creditsRetired = 0;
        long creditsIssued = 0;

        for (AuditLog log : logs) {
            BigDecimal amount = log.getCreditAmount() != null ? log.getCreditAmount() : BigDecimal.ZERO;
            
            if ("RETIRED".equals(log.getTransactionType()) || "RETIRE".equals(log.getTransactionType())) {
                creditsRetired += amount.longValue();
            } else if ("TRADE".equals(log.getTransactionType())) {
                creditsTraded += amount.longValue();
                totalValue = totalValue.add(amount.multiply(new BigDecimal("15.00")));
            } else if ("CREDIT_ISSUED".equals(log.getTransactionType())) {
                creditsIssued += amount.longValue();
            }
        }

        return ResponseEntity.ok(Map.of(
            "totalTransactions", totalTransactions,
            "creditTraded", creditsTraded,
            "creditRetired", creditsRetired,
            "creditIssued", creditsIssued,
            "totalValue", totalValue
        ));
    }
}
