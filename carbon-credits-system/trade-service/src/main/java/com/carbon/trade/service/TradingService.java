package com.carbon.trade.service;

import com.carbon.trade.client.CoreServiceClient;
import com.carbon.trade.client.UserServiceClient;
import com.carbon.trade.dao.ListingRepository;
import com.carbon.trade.dao.TradeDAO;
import com.carbon.trade.dto.CarbonCreditDTO;
import com.carbon.trade.dto.TransactionResponse;
import com.carbon.trade.model.Listing;
import com.carbon.trade.model.ListingStatus;
import com.carbon.trade.model.Trade;
import com.carbon.trade.model.TradeStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TradingService {

    private final CoreServiceClient coreServiceClient;
    private final UserServiceClient userServiceClient;
    private final TradeDAO tradeDAO;
    private final ListingRepository listingRepository;
    private final TradingEventPublisher eventPublisher;

    @Transactional
    public Listing createListing(Long creditId, Long sellerId, BigDecimal price) {
        log.info("Creating listing for credit {} by seller {} at price {}", creditId, sellerId, price);

        // 1. Verify Credit Ownership & Status
        CarbonCreditDTO credit = coreServiceClient.getCreditById(creditId);
        if (credit == null) {
            throw new IllegalArgumentException("Credit not found");
        }

        if (!credit.getOwnerId().equals(sellerId)) {
            throw new IllegalArgumentException("You do not own this credit");
        }
        if (!"ACTIVE".equals(credit.getStatus())) {
            throw new IllegalStateException("Credit must be ACTIVE to list");
        }

        // 2. Check for existing active listing
        boolean exists = listingRepository.existsByCreditIdAndStatus(creditId, ListingStatus.ACTIVE);
        if (exists) {
            throw new IllegalStateException("Credit is already listed");
        }

        // 3. Create Listing
        Listing listing = Listing.builder()
                .creditId(creditId)
                .sellerId(sellerId)
                .pricePerUnit(price)
                .status(ListingStatus.ACTIVE)
                .build();

        return listingRepository.save(listing);
    }

    @Transactional(readOnly = true)
    public List<Listing> getActiveListings() {
        return listingRepository.findAll().stream()
                .filter(l -> ListingStatus.ACTIVE.equals(l.getStatus()))
                .collect(Collectors.toList());
    }

    @Transactional(isolation = Isolation.READ_COMMITTED)
    public TransactionResponse buyCredit(Long listingId, Long buyerId) {
        log.info("Processing buy request. Listing: {}, Buyer: {}", listingId, buyerId);

        // 1. Find Listing
        Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new IllegalArgumentException("Listing not found"));

        if (!ListingStatus.ACTIVE.equals(listing.getStatus())) {
            throw new IllegalStateException("Listing is not active");
        }

        if (listing.getSellerId().equals(buyerId)) {
            throw new IllegalArgumentException("Cannot buy your own credit");
        }

        Long creditId = listing.getCreditId();
        Long sellerId = listing.getSellerId();
        BigDecimal price = listing.getPricePerUnit();

        // 2. Process Payment (Deduct from Buyer)
        try {
            userServiceClient.deductBalance(buyerId, price);
            log.info("Balance deducted from buyer {}", buyerId);
        } catch (Exception e) {
            log.error("Payment failed for buyer {}", buyerId, e);
            throw new IllegalStateException("Payment failed: " + e.getMessage());
        }

        // 3. Execute Transfer (Remote Call)
        try {
            Map<String, Long> transferRequest = new HashMap<>();
            transferRequest.put("currentOwnerId", sellerId);
            transferRequest.put("newOwnerId", buyerId);

            coreServiceClient.transferCredit(creditId, transferRequest, "ADMIN"); // Assuming ADMIN role allows system
                                                                                  // operations
        } catch (Exception e) {
            log.error("Failed to transfer credit in Core Service", e);
            // REFUND BUYER
            userServiceClient.addBalance(buyerId, price);
            throw new RuntimeException("Transfer failed: " + e.getMessage());
        }

        // 4. Pay Seller
        try {
            userServiceClient.addBalance(sellerId, price);
        } catch (Exception e) {
            log.error("Failed to pay seller {}. Manual reconciliation needed.", sellerId, e);
        }

        // 5. Update Listing Status
        listing.setStatus(ListingStatus.SOLD);
        listingRepository.save(listing);

        // 6. Record Trade locally
        Trade trade = Trade.builder()
                .sellerId(sellerId)
                .buyerId(buyerId)
                .creditId(creditId)
                .listingId(listingId)
                .pricePerUnit(price)
                .transactionType("BUY")
                .status(TradeStatus.COMPLETED)
                .transactionDate(LocalDateTime.now())
                .build();

        Trade savedTrade = tradeDAO.save(trade);
        log.info("Trade recorded. ID: {}", savedTrade.getId());

        // 7. Publish Trade Event
        CarbonCreditDTO credit = coreServiceClient.getCreditById(creditId);
        eventPublisher.publishTradeCompleted(com.carbon.trade.event.TradeCompletedEvent.builder()
                .tradeId(savedTrade.getId())
                .creditId(creditId)
                .sellerId(sellerId)
                .buyerId(buyerId)
                .pricePerUnit(price)
                .creditAmount(BigDecimal.valueOf(credit.getAmount()))
                .timestamp(LocalDateTime.now())
                .eventType("TRADE_COMPLETED")
                .build());

        return new TransactionResponse("Credit purchased successfully", savedTrade.getId());
    }

    @Transactional
    public TransactionResponse retireCredit(Long creditId, Long organizationId) {
        log.info("Processing retirement request for credit {} by org {}", creditId, organizationId);

        // 1. Verify Ownership
        CarbonCreditDTO credit = coreServiceClient.getCreditById(creditId);
        if (credit == null) {
            throw new IllegalArgumentException("Credit not found");
        }
        if (!credit.getOwnerId().equals(organizationId)) {
            throw new IllegalArgumentException("You do not own this credit");
        }

        // 2. Prepare Retirement Request
        Map<String, String> request = new HashMap<>();
        request.put("beneficiary", "Self (Organization " + organizationId + ")");
        request.put("reason", "Voluntary Retirement via Trading Service");

        // 3. Call Core Service to Retire
        try {
            coreServiceClient.retireCredit(creditId, request, "USER"); // Basic role matching core-service logic
        } catch (Exception e) {
            log.error("Failed to retire credit in Core Service", e);
            throw new IllegalStateException("Retirement failed: " + e.getMessage());
        }

        // 4. Record "Trade" as Retirement (Audit Trail)
        Trade trade = Trade.builder()
                .sellerId(organizationId)
                .buyerId(null)
                .creditId(creditId)
                .listingId(null)
                .pricePerUnit(BigDecimal.ZERO)
                .transactionType("RETIRE")
                .status(TradeStatus.COMPLETED)
                .transactionDate(LocalDateTime.now())
                .build();

        tradeDAO.save(trade);

        // 5. Publish Retirement Event
        eventPublisher.publishCreditRetired(com.carbon.trade.event.CreditRetiredEvent.builder()
                .creditId(creditId)
                .organizationId(organizationId)
                .creditAmount(BigDecimal.valueOf(credit.getAmount()))
                .beneficiary(request.get("beneficiary"))
                .reason(request.get("reason"))
                .timestamp(LocalDateTime.now())
                .eventType("CREDIT_RETIRED")
                .build());

        return new TransactionResponse("Credit retired successfully", trade.getId());
    }
}
