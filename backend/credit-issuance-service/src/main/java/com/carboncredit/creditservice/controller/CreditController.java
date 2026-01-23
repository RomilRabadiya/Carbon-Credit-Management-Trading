package com.carboncredit.creditservice.controller;

import com.carboncredit.creditservice.dto.CarbonCreditDTO;
import com.carboncredit.creditservice.dto.CreditListResponseDTO;
import com.carboncredit.creditservice.service.CreditIssuanceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/credits")
@RequiredArgsConstructor
@Slf4j
public class CreditController {

    private final CreditIssuanceService creditIssuanceService;

    @GetMapping("/{creditId}")
    public ResponseEntity<CarbonCreditDTO> getCreditById(@PathVariable Long creditId) {
        log.info("GET /api/credits/{} - Fetching credit by ID", creditId);

        try {
            CarbonCreditDTO credit = creditIssuanceService.getCreditById(creditId);
            return ResponseEntity.ok(credit);

        } catch (IllegalArgumentException e) {
            // Credit not found
            log.warn("Credit not found: {}", creditId);
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

        } catch (Exception e) {
            log.error("Error fetching credit {}: {}", creditId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get all credits for an organization
     * 
     * AUTHENTICATION: Assumes API Gateway validated JWT
     * AUTHORIZATION: Organization ID from path parameter
     * 
     * Best Practice: API Gateway should validate that JWT organization
     * matches the requested organizationId (prevent cross-org access)
     * 
     * @param organizationId Organization identifier
     * @return ResponseEntity with list of credits
     */
    @GetMapping("/organization/{organizationId}")
    public ResponseEntity<CreditListResponseDTO> getCreditsByOrganization(@PathVariable Long organizationId) {
        log.info("GET /api/credits/organization/{} - Fetching credits for organization", organizationId);

        try {
            CreditListResponseDTO response = creditIssuanceService.getCreditsByOrganization(organizationId.toString());
            return ResponseEntity.ok(response);

        } catch (Exception e) {
            log.error("Error fetching credits for organization {}: {}", organizationId, e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Health check endpoint for monitoring
     * Not authenticated - used by load balancers/monitoring systems
     */
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("CREDIT-SERVICE is healthy");
    }
}
