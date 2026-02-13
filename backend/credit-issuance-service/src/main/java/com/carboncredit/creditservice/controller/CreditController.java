package com.carboncredit.creditservice.controller;

import com.carboncredit.creditservice.service.CreditIssuanceService;
import java.math.BigDecimal;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/credits")
public class CreditController {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(CreditController.class);

    private final CreditIssuanceService creditIssuanceService;

    public CreditController(CreditIssuanceService creditIssuanceService) {
        this.creditIssuanceService = creditIssuanceService;
    }

    @PostMapping("/issue")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('VERIFIER')")
    public ResponseEntity<Void> issueCredits(@RequestBody Map<String, Object> request) {
        log.info("Received credit issuance request: {}", request);
        // ... (rest of logic)
        Long projectId = ((Number) request.get("projectId")).longValue();
        BigDecimal amount = new BigDecimal(request.get("amount").toString());
        Long ownerId = ((Number) request.get("ownerId")).longValue();

        creditIssuanceService.issueCredits(projectId, amount, ownerId);
        return ResponseEntity.ok().build();
    }

    /**
     * Retire a carbon credit (burn it).
     * Requires beneficiary and reason for anti-fraud.
     */
    @PostMapping("/{creditId}/retire")
    // In real world, owner check is done inside service logic too
    @org.springframework.security.access.prepost.PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> retireCredit(
            @PathVariable Long creditId,
            @RequestBody Map<String, String> request) {

        String beneficiary = request.get("beneficiary");
        String reason = request.get("reason");

        if (beneficiary == null || reason == null) {
            return ResponseEntity.badRequest().build();
        }

        try {
            creditIssuanceService.retireCredit(creditId, beneficiary, reason);
            return ResponseEntity.ok().build();
        } catch (IllegalStateException | IllegalArgumentException e) {
            log.warn("Retirement failed: {}", e.getMessage());
            return ResponseEntity.badRequest().build();
        }
    }

    // ... (Getters can be public or authenticated)

    /**
     * Internal/System Endpoint to Transfer Credit Ownership
     * Used by Trading Service when a trade is completed.
     * Ideally protected by "Inter-Service Token" or simply Admin role for now.
     */
    @PostMapping("/{creditId}/transfer")
    public ResponseEntity<Void> transferCredit(
            @PathVariable Long creditId,
            @RequestBody Map<String, Long> request) {
        // Internal endpoint remains open for Feign access (or secured via network level
        // in real prod)
        // For now, leaving open to avoid Feign 403 complexity without token relay
        Long currentOwnerId = request.get("currentOwnerId");
        Long newOwnerId = request.get("newOwnerId");

        if (currentOwnerId == null || newOwnerId == null) {
            return ResponseEntity.badRequest().build();
        }

        try {
            log.info("Request to transfer credit {} from {} to {}", creditId, currentOwnerId, newOwnerId);
            creditIssuanceService.transferCredit(creditId, currentOwnerId, newOwnerId);
            return ResponseEntity.ok().build();
        } catch (IllegalArgumentException e) {
            log.warn("Transfer failed: {}", e.getMessage());
            return ResponseEntity.badRequest().build(); // 400 if owner mismatch or not found
        } catch (IllegalStateException e) {
            log.warn("Transfer failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).build(); // 409 if status invalid
        }
    }
}
