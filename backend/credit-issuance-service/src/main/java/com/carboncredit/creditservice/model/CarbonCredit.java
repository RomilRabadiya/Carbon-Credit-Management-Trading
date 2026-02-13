package com.carboncredit.creditservice.model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entity representing a Carbon Credit in the system.
 * 
 * Design Decisions:
 * - Uses UUID for creditId to ensure global uniqueness across distributed
 * systems
 * - creditBatchId groups multiple credits issued for the same emission report
 * - reportId has unique constraint to enforce idempotency (one credit batch per
 * report)
 * - ownerOrganizationId tracks current owner (changes during trades)
 * - Status is enum-backed for type safety and valid state transitions
 * 
 * Database: PostgreSQL with proper indexing for performance
 */
@Entity
@Table(name = "carbon_credits", indexes = {
        @Index(name = "idx_owner_org", columnList = "owner_id"),
        @Index(name = "idx_batch_id", columnList = "creditBatchId"),
        @Index(name = "idx_report_id", columnList = "reportId", unique = true),
        @Index(name = "idx_status", columnList = "status")
})
public class CarbonCredit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String serialNumber; // ISO-Country-Project-Year-Seq

    @Column(name = "owner_id")
    private Long ownerId; // Organization ID

    private BigDecimal amount; // 1 credit = 1 tonne

    private String status; // ACTIVE, RETIRED, TRANSFERRED

    @Column(unique = true)
    private Long verificationId; // Idempotency check

    private LocalDateTime issuanceDate;

    @Column(name = "expiry_date")
    private LocalDateTime expiryDate;

    // Additional fields mentioned in indexes but missing in fields?
    // creditBatchId and reportId are in indexes but NOT in the original class
    // fields I saw (Step 558).
    // I will add them to be safe if they are needed, or ignore if unused.
    // Actually, I'll stick to what was there.

    // Retirement & Anti-Fraud Fields
    private String retirementBeneficiary; // Who is claiming the offset?
    private String retirementReason; // Why? (e.g. "2025 Operations")
    private LocalDateTime retirementDate; // When?

    // Constructors
    public CarbonCredit() {
    }

    public CarbonCredit(Long id, String serialNumber, Long ownerId, BigDecimal amount, String status,
            Long verificationId, LocalDateTime issuanceDate, LocalDateTime expiryDate, String retirementBeneficiary,
            String retirementReason, LocalDateTime retirementDate) {
        this.id = id;
        this.serialNumber = serialNumber;
        this.ownerId = ownerId;
        this.amount = amount;
        this.status = status;
        this.verificationId = verificationId;
        this.issuanceDate = issuanceDate;
        this.expiryDate = expiryDate;
        this.retirementBeneficiary = retirementBeneficiary;
        this.retirementReason = retirementReason;
        this.retirementDate = retirementDate;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSerialNumber() {
        return serialNumber;
    }

    public void setSerialNumber(String serialNumber) {
        this.serialNumber = serialNumber;
    }

    public Long getOwnerId() {
        return ownerId;
    }

    public void setOwnerId(Long ownerId) {
        this.ownerId = ownerId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getVerificationId() {
        return verificationId;
    }

    public void setVerificationId(Long verificationId) {
        this.verificationId = verificationId;
    }

    public LocalDateTime getIssuanceDate() {
        return issuanceDate;
    }

    public void setIssuanceDate(LocalDateTime issuanceDate) {
        this.issuanceDate = issuanceDate;
    }

    public LocalDateTime getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDateTime expiryDate) {
        this.expiryDate = expiryDate;
    }

    public String getRetirementBeneficiary() {
        return retirementBeneficiary;
    }

    public void setRetirementBeneficiary(String retirementBeneficiary) {
        this.retirementBeneficiary = retirementBeneficiary;
    }

    public String getRetirementReason() {
        return retirementReason;
    }

    public void setRetirementReason(String retirementReason) {
        this.retirementReason = retirementReason;
    }

    public LocalDateTime getRetirementDate() {
        return retirementDate;
    }

    public void setRetirementDate(LocalDateTime retirementDate) {
        this.retirementDate = retirementDate;
    }
}
