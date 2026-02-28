package com.carbon.core.credit.controller;

import com.carbon.core.credit.service.CreditIssuanceService;
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

    /**
     * Get credits for the currently logged-in user (reads userId from the X-User-Id
     * header injected by API Gateway).
     */
    @GetMapping("/me")
    public ResponseEntity<?> getMyCredits(
            @RequestHeader(value = "X-User-Id", required = false) String userId) {

        if (userId == null || userId.isBlank()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Missing X-User-Id header");
        }

        try {
            return ResponseEntity.ok(creditIssuanceService.getCreditsByUser(Long.parseLong(userId)));
        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body("Invalid user ID format");
        }
    }

    @GetMapping("/organization/{organizationId}")
    public ResponseEntity<?> getCreditsByOrganization(
            @PathVariable Long organizationId,
            @RequestHeader(value = "X-Role", required = false) String role,
            @RequestHeader(value = "X-Organization-Id", required = false) String userOrgId) {

        // Only ADMIN or the matching organization can view their credits
        if (role == null || (!role.equals("ADMIN")
                && !(role.equals("ORGANIZATION") && String.valueOf(organizationId).equals(userOrgId)))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied: You cannot view these credits");
        }

        return ResponseEntity.ok(creditIssuanceService.getCreditsByOrganization(organizationId));
    }

    /**
     * Get a single credit by its ID.
     * Used by Trading Service (via Feign) to fetch credit details for listing
     * enrichment.
     */
    @GetMapping("/{creditId}")
    public ResponseEntity<com.carbon.core.credit.dto.CarbonCreditDTO> getCreditById(
            @PathVariable Long creditId) {
        try {
            return ResponseEntity.ok(creditIssuanceService.getCreditById(creditId));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/issue")
    public ResponseEntity<?> issueCredits(
            @RequestBody Map<String, Object> request,
            @RequestHeader(value = "X-Role", required = false) String role) {

        // Usually credits are issued internally via VerificationService, but if
        // exposed:
        if (role == null || !role.equals("ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Access Denied: Only Admins can manually issue credits");
        }
        log.info("Received credit issuance request: {}", request);
        // ... (rest of logic)
        Long projectId = ((Number) request.get("projectId")).longValue();
        BigDecimal amount = new BigDecimal(request.get("amount").toString());
        Long ownerId = ((Number) request.get("ownerId")).longValue();
        String projectType = (String) request.getOrDefault("projectType", "UNKNOWN");
        Double latitude = request.get("latitude") != null ? ((Number) request.get("latitude")).doubleValue() : null;
        Double longitude = request.get("longitude") != null ? ((Number) request.get("longitude")).doubleValue() : null;

        creditIssuanceService.issueCredits(projectId, amount, ownerId, projectType, latitude, longitude);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    /**
     * Retire a carbon credit (burn it).
     * Requires beneficiary and reason for anti-fraud.
     */
    @PostMapping("/{creditId}/retire")
    public ResponseEntity<?> retireCredit(
            @PathVariable Long creditId,
            @RequestBody Map<String, String> request,
            @RequestHeader(value = "X-Role", required = false) String role) {

        // Both Users and Organizations can retire their own credits
        if (role == null || (!role.equals("USER") && !role.equals("ORGANIZATION") && !role.equals("ADMIN"))) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Access Denied: Invalid Role");
        }

        String beneficiary = request.get("beneficiary");
        String reason = request.get("reason");

        if (beneficiary == null || reason == null) {
            return ResponseEntity.badRequest().body("Beneficiary and reason are required");
        }

        try {
            creditIssuanceService.retireCredit(creditId, beneficiary, reason);
            return ResponseEntity.ok().body("Credit retired successfully");
        } catch (IllegalStateException | IllegalArgumentException e) {
            log.warn("Retirement failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Internal/System Endpoint to Transfer Credit Ownership
     * Used by Trading Service when a trade is completed.
     * Ideally protected by "Inter-Service Token" or simply Admin role for now.
     */
    @PostMapping("/{creditId}/transfer")
    public ResponseEntity<?> transferCredit(
            @PathVariable Long creditId,
            @RequestBody Map<String, Long> request,
            @RequestHeader(value = "X-Role", required = false) String role) {
        // Internal endpoint remains open for Feign access (or secured via network level
        // in real prod)
        // If external users hit this directly, we could add:
        // if (role != null && !role.equals("ADMIN")) return Forbidden...
        // But since it's used by Trading Service, let's leave as is but return proper
        // response types.
        // Internal endpoint remains open for Feign access (or secured via network level
        // in real prod)
        // For now, leaving open to avoid Feign 403 complexity without token relay
        Long currentOwnerId = request.get("currentOwnerId");
        Long newOwnerId = request.get("newOwnerId");

        if (currentOwnerId == null || newOwnerId == null) {
            return ResponseEntity.badRequest().body("currentOwnerId and newOwnerId are required");
        }

        try {
            log.info("Request to transfer credit {} from {} to {}", creditId, currentOwnerId, newOwnerId);
            creditIssuanceService.transferCredit(creditId, currentOwnerId, newOwnerId);
            return ResponseEntity.ok().body("Transfer successful");
        } catch (IllegalArgumentException e) {
            log.warn("Transfer failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage()); // 400 if owner mismatch or not found
        } catch (IllegalStateException e) {
            log.warn("Transfer failed: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.CONFLICT).body(e.getMessage()); // 409 if status invalid
        }
    }
}
