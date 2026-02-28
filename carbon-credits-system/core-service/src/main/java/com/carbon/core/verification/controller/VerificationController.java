package com.carbon.core.verification.controller;

import com.carbon.core.verification.model.VerificationRequest;
import com.carbon.core.verification.service.VerificationService;
import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
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
    public ResponseEntity<?> initiateVerification(
            @RequestBody VerificationRequest request,
            @RequestHeader(value = "X-Role", required = false) String role) {

        // Generally, verifications are initiated by the system after an emission
        // report,
        // but if manual, we can restrict it to ORGANIZATION or ADMIN
        if (role == null || (!role.equals("ORGANIZATION") && !role.equals("ADMIN"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access Denied: Only Organizations can initiate verification");
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(verificationService.createVerification(request));
    }

    @GetMapping
    public ResponseEntity<List<VerificationRequest>> getAllVerifications() {
        return ResponseEntity.ok(verificationService.getAllVerifications());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getVerificationById(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(verificationService.getVerificationById(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveVerification(
            @PathVariable Long id,
            @RequestBody Map<String, Object> requestBody,
            @RequestHeader(value = "X-Role", required = false) String role) {

        if (role == null || (!role.equals("VERIFIER") && !role.equals("ADMIN"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied: Only Verifiers can approve");
        }

        String remarks = (String) requestBody.getOrDefault("remarks", "Manually approved");

        try {
            return ResponseEntity.ok(
                    verificationService.approveVerification(id, remarks));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(409).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/reject")
    public ResponseEntity<?> rejectVerification(
            @PathVariable Long id,
            @RequestBody Map<String, Object> requestBody,
            @RequestHeader(value = "X-Role", required = false) String role) {

        if (role == null || (!role.equals("VERIFIER") && !role.equals("ADMIN"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied: Only Verifiers can reject");
        }

        String remarks = (String) requestBody.getOrDefault("remarks", "Manually rejected");

        try {
            return ResponseEntity.ok(
                    verificationService.rejectVerification(id, remarks));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(409).body(e.getMessage());
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/organization/{orgId}")
    public ResponseEntity<List<VerificationRequest>> getVerificationsByOrganization(
            @PathVariable Long orgId) {

        return ResponseEntity.ok(
                verificationService.getVerificationsByOrganization(orgId));
    }
}
