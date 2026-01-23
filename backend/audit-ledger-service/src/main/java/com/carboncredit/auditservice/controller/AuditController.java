package com.carboncredit.auditservice.controller;

import com.carboncredit.auditservice.dao.AuditDAO;
import com.carboncredit.auditservice.model.AuditRecord;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
public class AuditController {

    private final AuditDAO auditDAO;

    @GetMapping("/chain-of-custody/{serialNumber}")
    public ResponseEntity<List<AuditRecord>> getChainOfCustody(@PathVariable String serialNumber) {
        List<AuditRecord> history = auditDAO.findBySerialNumberOrderByTimestampAsc(serialNumber);
        return ResponseEntity.ok(history);
    }

    // Note: A full chain of custody would also trace back to Verification and
    // Emission events using verificationId/reportId
    // For this MVP, we mainly track the credit's lifecycle by serial number.
    // Ideally, we would recursively fetch parent events.
}
