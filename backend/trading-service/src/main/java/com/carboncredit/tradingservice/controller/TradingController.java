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

    @PostMapping("/retire/{creditId}")
    public ResponseEntity<TransactionResponse> retireCredit(
            @PathVariable Long creditId,
            @RequestHeader("X-Organization-Id") Long organizationId) {

        log.info("Received retirement request for credit {} from org {}", creditId, organizationId);

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
