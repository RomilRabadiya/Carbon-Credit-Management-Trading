package com.carboncredit.tradingservice.controller;

import com.carboncredit.tradingservice.dto.TransactionResponse;
import com.carboncredit.tradingservice.service.TradingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/trading")
@RequiredArgsConstructor
@Slf4j
public class TradingController {

    private final TradingService tradingService;
    private final com.carboncredit.tradingservice.client.UserClient userClient;

    @PostMapping("/list")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<com.carboncredit.tradingservice.model.Listing> listCredit(
            @RequestBody java.util.Map<String, Object> request,
            @RequestHeader("X-Organization-Id") Long organizationId) {

        Long creditId = ((Number) request.get("creditId")).longValue();
        java.math.BigDecimal price = new java.math.BigDecimal(request.get("price").toString());

        return ResponseEntity.ok(tradingService.createListing(creditId, organizationId, price));
    }

    @GetMapping("/listings")
    public ResponseEntity<java.util.List<com.carboncredit.tradingservice.model.Listing>> getActiveListings() {
        return ResponseEntity.ok(tradingService.getActiveListings());
    }

    @PostMapping("/buy")
    public ResponseEntity<TransactionResponse> buyCredit(
            @RequestBody java.util.Map<String, String> request) {

        // Verify user and get organization ID
        try {
            com.carboncredit.common.dto.ResponseEnvelope<Object> userResponse = userClient.getCurrentUser();
            // userResponse.getData() is likely a LinkedHashMap because of JSON
            // deserialization if DTO not shared
            // We need to extract extracted role and organization ID
            // Ideally use specific DTO, but for now map it.

            java.util.Map<String, Object> userData = (java.util.Map<String, Object>) userResponse.getData();
            String role = (String) userData.get("role");

            // Check if user is Organization or has Buyer permissions
            if (!"ORGANIZATION".equalsIgnoreCase(role) && !"BUYER".equalsIgnoreCase(role)) {
                return ResponseEntity.status(403)
                        .body(new TransactionResponse("User does not have permission to buy", null));
            }

            Object orgIdObj = userData.get("organizationId");
            if (orgIdObj == null) {
                return ResponseEntity.status(403)
                        .body(new TransactionResponse("User is not associated with an organization", null));
            }

            Long buyerId = ((Number) orgIdObj).longValue();

            java.util.UUID listingId = java.util.UUID.fromString(request.get("listingId"));
            return ResponseEntity.ok(tradingService.buyCredit(listingId, buyerId));

        } catch (Exception e) {
            log.error("Error verifying user for buy request", e);
            return ResponseEntity.status(401).body(new TransactionResponse("Unauthorized: " + e.getMessage(), null));
        }
    }

    @PostMapping("/retire/{creditId}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('BUYER', 'SELLER')")
    public ResponseEntity<TransactionResponse> retireCredit(
            @PathVariable Long creditId,
            @RequestHeader("X-Organization-Id") Long organizationId) {

        log.info("Received retirement request for credit {} from org {}", creditId, organizationId);
        // ... (Keep existing)
        try {
            TransactionResponse response = tradingService.retireCredit(creditId, organizationId);
            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            log.warn("Retirement failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new TransactionResponse(e.getMessage(), null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Unexpected error retiring credit", e);
            return ResponseEntity.internalServerError().body(new TransactionResponse("Internal Server Error", null));
        }
    }
}
