package com.carbon.trade.controller;

import com.carbon.trade.dto.TransactionResponse;
import com.carbon.trade.model.Listing;
import com.carbon.trade.service.TradingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/trading")
@RequiredArgsConstructor
@Slf4j
public class TradingController {

    private final TradingService tradingService;

    @PostMapping("/list")
    public ResponseEntity<?> listCredit(
            @RequestBody Map<String, Object> request,
            @RequestHeader("X-User-Id") Long userId) {

        try {
            Long creditId = ((Number) request.get("creditId")).longValue();
            BigDecimal price = new BigDecimal(request.get("price").toString());

            Listing listing = tradingService.createListing(creditId, userId, price);
            return ResponseEntity.ok(listing);
        } catch (IllegalArgumentException | IllegalStateException e) {
            log.warn("Listing failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error creating listing", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Internal server error: " + e.getMessage()));
        }
    }

    @GetMapping("/listings")
    public ResponseEntity<List<Listing>> getActiveListings() {
        return ResponseEntity.ok(tradingService.getActiveListings());
    }

    @PostMapping("/buy")
    public ResponseEntity<?> buyCredit(
            @RequestBody Map<String, String> request,
            @RequestHeader("X-User-Id") Long buyerId) {
        try {
            Long listingId = Long.parseLong(request.get("listingId"));
            TransactionResponse response = tradingService.buyCredit(listingId, buyerId);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException | IllegalStateException e) {
            log.warn("Buy failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            log.error("Unexpected error buying credit", e);
            return ResponseEntity.internalServerError()
                    .body(Map.of("message", "Internal server error: " + e.getMessage()));
        }
    }

    @PostMapping("/retire/{creditId}")
    public ResponseEntity<TransactionResponse> retireCredit(
            @PathVariable Long creditId,
            @RequestHeader("X-User-Id") Long userId) {

        log.info("Received retirement request for credit {} from user {}", creditId, userId);
        try {
            TransactionResponse response = tradingService.retireCredit(creditId, userId);
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
