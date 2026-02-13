package com.carboncredit.creditservice.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class CarbonCreditDTO {
    private Long id;
    private String serialNumber;
    private Long ownerId;
    private BigDecimal amount;
    private String status;
    private Long verificationId;
    private LocalDateTime issuanceDate;

    public CarbonCreditDTO() {
    }

    public CarbonCreditDTO(Long id, String serialNumber, Long ownerId, BigDecimal amount, String status,
            Long verificationId, LocalDateTime issuanceDate) {
        this.id = id;
        this.serialNumber = serialNumber;
        this.ownerId = ownerId;
        this.amount = amount;
        this.status = status;
        this.verificationId = verificationId;
        this.issuanceDate = issuanceDate;
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
}
