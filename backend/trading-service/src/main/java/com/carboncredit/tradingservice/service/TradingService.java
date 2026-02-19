package com.carboncredit.tradingservice.service;

import com.carboncredit.common.event.CreditRetiredEvent;
import com.carboncredit.tradingservice.client.CreditClient;
import com.carboncredit.tradingservice.dao.TradeDAO;
import com.carboncredit.tradingservice.dto.CarbonCreditDTO;
import com.carboncredit.tradingservice.dto.TransactionResponse;
import com.carboncredit.tradingservice.model.Trade;
import com.carboncredit.tradingservice.model.TradeStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class TradingService {

    private final CreditClient creditClient;
    private final TradeDAO tradeDAO;
    private final com.carboncredit.tradingservice.dao.ListingRepository listingRepository;
    private final com.carboncredit.tradingservice.client.OrganizationClient organizationClient;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${kafka.topic.credit-retired:credit-retired-topic}")
    private String creditRetiredTopic;

    @Value("${kafka.topic.trade-completed:trade-completed-topic}")
    private String tradeCompletedTopic;

    // ... (keep existing methods until buyCredit)

    /**
     * Buy a listed credit
     */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    @SuppressWarnings("null")
    public TransactionResponse buyCredit(java.util.UUID listingId, Long buyerId) {
        log.info("Processing buy request. Listing: {}, Buyer: {}", listingId, buyerId);

        // 1. Find Listing
        com.carboncredit.tradingservice.model.Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new IllegalArgumentException("Listing not found"));

        if (!com.carboncredit.tradingservice.model.ListingStatus.ACTIVE.equals(listing.getStatus())) {
            throw new IllegalStateException("Listing is not active");
        }

        if (listing.getSellerId().equals(buyerId)) {
            throw new IllegalArgumentException("Cannot buy your own credit");
        }

        Long creditId = listing.getCreditId();
        Long sellerId = listing.getSellerId();
        java.math.BigDecimal price = listing.getPricePerUnit();

        // 2. Process Payment (Deduct from Buyer)
        try {
            organizationClient.deductBalance(buyerId, price);
            log.info("Balance deducted from buyer {}", buyerId);
        } catch (Exception e) {
            log.error("Payment failed for buyer {}", buyerId, e);
            throw new IllegalStateException("Payment failed: " + e.getMessage());
        }

        // 3. Execute Transfer (Remote Call)
        try {
            java.util.Map<String, Long> transferRequest = new java.util.HashMap<>();
            transferRequest.put("currentOwnerId", sellerId);
            transferRequest.put("newOwnerId", buyerId);

            creditClient.transferCredit(creditId, transferRequest);
        } catch (Exception e) {
            log.error("Failed to transfer credit in Credit Service", e);
            // REFUND BUYER
            organizationClient.addBalance(buyerId, price);
            throw new RuntimeException("Transfer failed: " + e.getMessage());
        }

        // 4. Pay Seller
        try {
            organizationClient.addBalance(sellerId, price);
        } catch (Exception e) {
            log.error("Failed to pay seller {}. Manual reconciliation needed.", sellerId, e);
            // This is a critical failure state - in real world, we need a reconciliation
            // job.
        }

        // 5. Update Listing Status
        listing.setStatus(com.carboncredit.tradingservice.model.ListingStatus.SOLD);
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

        // 7. Publish Trade Completed Event (For Audit Ledger)
        com.carboncredit.common.event.TradeCompletedEvent event = com.carboncredit.common.event.TradeCompletedEvent
                .builder()
                .listingId(listingId)
                .buyerId(buyerId)
                .sellerId(sellerId)
                .creditId(creditId)
                .pricePerUnit(price)
                .timestamp(LocalDateTime.now())
                .eventType("TRADE_COMPLETED")
                .build();

        kafkaTemplate.send(tradeCompletedTopic, event);

        return new TransactionResponse("Credit purchased successfully", savedTrade.getId());
    }

    @Transactional
    @SuppressWarnings("null")
    public com.carboncredit.tradingservice.model.Listing createListing(Long creditId, Long sellerId,
            java.math.BigDecimal price) {
        log.info("Creating listing for credit {} by seller {} at price {}", creditId, sellerId, price);

        // 1. Verify Credit Ownership & Status
        CarbonCreditDTO credit = creditClient.getCreditById(creditId);
        if (credit == null)
            throw new IllegalArgumentException("Credit not found");

        if (!credit.getOwnerId().equals(sellerId)) {
            throw new IllegalArgumentException("You do not own this credit");
        }
        if (!"ACTIVE".equals(credit.getStatus())) {
            throw new IllegalStateException("Credit must be ACTIVE to list");
        }

        // 2. Check for existing active listing
        boolean exists = listingRepository.existsByCreditIdAndStatus(creditId,
                com.carboncredit.tradingservice.model.ListingStatus.ACTIVE);
        if (exists) {
            throw new IllegalStateException("Credit is already listed");
        }

        // 3. Derive vintage from issuance date
        String vintage = credit.getIssuanceDate() != null
                ? String.valueOf(credit.getIssuanceDate().getYear())
                : "N/A";

        // 4. Fetch seller's organization name for display
        String sellerName = "Unknown";
        try {
            com.carboncredit.common.dto.ResponseEnvelope<Object> orgResponse = organizationClient
                    .getOrganization(sellerId);
            if (orgResponse != null && orgResponse.getData() != null) {
                java.util.Map<String, Object> orgData = (java.util.Map<String, Object>) orgResponse.getData();
                sellerName = (String) orgData.getOrDefault("name", "Unknown");
            }
        } catch (Exception e) {
            log.warn("Could not fetch organization name for seller {}: {}", sellerId, e.getMessage());
        }

        // 5. Build location string from credit's lat/lon
        String location = null;
        if (credit.getLatitude() != null && credit.getLongitude() != null) {
            location = String.format("Lat %.4f, Lon %.4f", credit.getLatitude(), credit.getLongitude());
        }

        // 6. Create Listing with snapshot fields for marketplace display
        com.carboncredit.tradingservice.model.Listing listing = com.carboncredit.tradingservice.model.Listing.builder()
                .creditId(creditId)
                .sellerId(sellerId)
                .pricePerUnit(price)
                .status(com.carboncredit.tradingservice.model.ListingStatus.ACTIVE)
                // Snapshot fields (denormalized for fast marketplace queries)
                .sellerName(sellerName)
                .amount(credit.getAmount() != null
                        ? java.math.BigDecimal.valueOf(credit.getAmount())
                        : java.math.BigDecimal.ZERO)
                .serialNumber(credit.getSerialNumber())
                .projectType(credit.getProjectType())
                .location(location)
                .vintage(vintage)
                .build();

        return listingRepository.save(listing);
    }

    @Transactional(readOnly = true)
    public java.util.List<com.carboncredit.tradingservice.model.Listing> getActiveListings() {
        return listingRepository.findAll().stream()
                .filter(l -> com.carboncredit.tradingservice.model.ListingStatus.ACTIVE.equals(l.getStatus()))
                .collect(java.util.stream.Collectors.toList());
    }

    @Transactional
    @SuppressWarnings("null")
    public TransactionResponse retireCredit(Long creditId, Long organizationId) {
        log.info("Processing retirement request for credit {} by org {}", creditId, organizationId);

        // 1. Verify Ownership
        CarbonCreditDTO credit = creditClient.getCreditById(creditId);
        if (credit == null)
            throw new IllegalArgumentException("Credit not found");
        if (!credit.getOwnerId().equals(organizationId)) {
            throw new IllegalArgumentException("You do not own this credit");
        }

        // 2. Prepare Retirement Request
        java.util.Map<String, String> request = new java.util.HashMap<>();
        request.put("beneficiary", "Self (Organization " + organizationId + ")");
        request.put("reason", "Voluntary Retirement via Trading Service");

        // 3. Call Credit Service to Retire
        try {
            creditClient.retireCredit(creditId, request);
        } catch (Exception e) {
            log.error("Failed to retire credit in Credit Service", e);
            throw new IllegalStateException("Retirement failed: " + e.getMessage());
        }

        // 4. Record "Trade" as Retirement (Audit Trail)
        Trade trade = Trade.builder()
                .sellerId(organizationId)
                .buyerId(null) // No buyer
                .creditId(creditId)
                .listingId(null)
                .pricePerUnit(java.math.BigDecimal.ZERO)
                .transactionType("RETIRE")
                .status(TradeStatus.COMPLETED)
                .transactionDate(LocalDateTime.now())
                .build();

        tradeDAO.save(trade);

        // 5. Publish Event
        CreditRetiredEvent event = CreditRetiredEvent.builder()
                .creditId(creditId)
                .ownerId(organizationId)
                .serialNumber(credit.getSerialNumber())
                .reason("Voluntary Retirement")
                .transactionId(trade.getId())
                .timestamp(LocalDateTime.now())
                .eventType("CREDIT_RETIRED")
                .build();
        // Since we don't have a specific topic for this in this service config yet, we
        // can use the creditRetiredTopic if configured
        // or just rely on the CreditService's event. But let's send it if we have the
        // topic.
        if (creditRetiredTopic != null && !creditRetiredTopic.isEmpty()) {
            kafkaTemplate.send(creditRetiredTopic, event);
        }

        return new TransactionResponse("Credit retired successfully", trade.getId());
    }
}
