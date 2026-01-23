package com.carboncredit.verificationservice.controller;

import com.carboncredit.verificationservice.model.VerificationRequest;
import com.carboncredit.verificationservice.service.VerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/verifications")
@RequiredArgsConstructor
public class VerificationController {

    private final VerificationService verificationService;

    @GetMapping
    public ResponseEntity<List<VerificationRequest>> getAllVerifications() {
        return ResponseEntity.ok(verificationService.getAllVerifications());
    }

    @GetMapping("/{id}")
    public ResponseEntity<VerificationRequest> getVerificationById(@PathVariable Long id) {
        return ResponseEntity.ok(verificationService.getVerificationById(id));
    }

    @GetMapping("/organization/{orgId}")
    public ResponseEntity<List<VerificationRequest>> getVerificationsByOrganization(@PathVariable Long orgId) {
        return ResponseEntity.ok(verificationService.getVerificationsByOrganization(orgId));
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<VerificationRequest> approveVerification(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {

        BigDecimal creditsCalculated = new BigDecimal(request.get("creditsCalculated").toString());
        String remarks = (String) request.getOrDefault("remarks", "Manually approved");

        return ResponseEntity.ok(verificationService.approveVerification(id, creditsCalculated, remarks));
    }
}
