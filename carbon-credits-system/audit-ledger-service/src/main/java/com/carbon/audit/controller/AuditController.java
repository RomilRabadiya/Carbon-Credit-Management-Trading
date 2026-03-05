package com.carbon.audit.controller;

import com.carbon.audit.entity.AuditLog;
import com.carbon.audit.entity.LedgerEntry;
import com.carbon.audit.repository.AuditLogRepository;
import com.carbon.audit.repository.LedgerEntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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
}
