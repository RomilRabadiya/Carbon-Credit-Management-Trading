package com.carboncredit.verificationservice.controller;

import com.carboncredit.verificationservice.model.VerificationRequest;
import com.carboncredit.verificationservice.service.VerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/verifications")
@RequiredArgsConstructor
public class VerificationController {

    private final VerificationService verificationService;

    @PostMapping
    public ResponseEntity<VerificationRequest> initiateVerification(@RequestBody VerificationRequest request) {
        return ResponseEntity.ok(verificationService.createVerification(request));
    }

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
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('VERIFIER')")
    public ResponseEntity<VerificationRequest> approveVerification(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {

        String remarks = (String) request.getOrDefault("remarks", "Manually approved");

        return ResponseEntity.ok(verificationService.approveVerification(id, remarks));
    }

    @PostMapping("/{id}/reject")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('VERIFIER')")
    public ResponseEntity<VerificationRequest> rejectVerification(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {

        String remarks = (String) request.getOrDefault("remarks", "Manually rejected");

        return ResponseEntity.ok(verificationService.rejectVerification(id, remarks));
    }
}
