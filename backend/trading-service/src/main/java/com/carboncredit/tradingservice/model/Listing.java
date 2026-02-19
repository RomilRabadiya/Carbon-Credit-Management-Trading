package com.carboncredit.tradingservice.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "listings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Listing {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private Long creditId;

    @Column(nullable = false)
    private Long sellerId;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerUnit;

    // Use string storage for enum to be safe
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ListingStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // === Denormalized snapshot fields (populated at listing creation) ===
    private String sellerName; // From User/Org service
    private BigDecimal amount; // From CarbonCredit.amount
    private String serialNumber; // From CarbonCredit.serialNumber
    private String projectType; // From CarbonCredit (traced from EmissionReport)
    private String location; // Human-readable location
    private String vintage; // Year derived from issuanceDate

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
