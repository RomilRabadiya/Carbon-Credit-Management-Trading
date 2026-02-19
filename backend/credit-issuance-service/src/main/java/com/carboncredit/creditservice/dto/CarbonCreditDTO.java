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
    private String projectType;
    private Double latitude;
    private Double longitude;

    public CarbonCreditDTO() {
    }

    public CarbonCreditDTO(Long id, String serialNumber, Long ownerId, BigDecimal amount, String status,
            Long verificationId, LocalDateTime issuanceDate, String projectType,
            Double latitude, Double longitude) {
        this.id = id;
        this.serialNumber = serialNumber;
        this.ownerId = ownerId;
        this.amount = amount;
        this.status = status;
        this.verificationId = verificationId;
        this.issuanceDate = issuanceDate;
        this.projectType = projectType;
        this.latitude = latitude;
        this.longitude = longitude;
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

    public String getProjectType() {
        return projectType;
    }

    public void setProjectType(String projectType) {
        this.projectType = projectType;
    }

    public Double getLatitude() {
        return latitude;
    }

    public void setLatitude(Double latitude) {
        this.latitude = latitude;
    }

    public Double getLongitude() {
        return longitude;
    }

    public void setLongitude(Double longitude) {
        this.longitude = longitude;
    }
}
