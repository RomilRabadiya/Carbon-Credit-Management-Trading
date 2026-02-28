package com.carbon.core.event;

import java.math.BigDecimal;

public class CreditIssuedEvent {
    private Long creditId;
    private String serialNumber;
    private Long organizationId;
    private Long verificationId;
    private BigDecimal creditAmount;
    private String unit;
    private String eventType;

    public CreditIssuedEvent() {
    }

    public CreditIssuedEvent(Long creditId, String serialNumber, Long organizationId, Long verificationId,
            BigDecimal creditAmount, String unit, String eventType) {
        this.creditId = creditId;
        this.serialNumber = serialNumber;
        this.organizationId = organizationId;
        this.verificationId = verificationId;
        this.creditAmount = creditAmount;
        this.unit = unit;
        this.eventType = eventType;
    }

    public static CreditIssuedEventBuilder builder() {
        return new CreditIssuedEventBuilder();
    }

    // Getters
    public Long getCreditId() {
        return creditId;
    }

    public String getSerialNumber() {
        return serialNumber;
    }

    public Long getOrganizationId() {
        return organizationId;
    }

    public Long getVerificationId() {
        return verificationId;
    }

    public BigDecimal getCreditAmount() {
        return creditAmount;
    }

    public String getUnit() {
        return unit;
    }

    public String getEventType() {
        return eventType;
    }

    // Setters
    public void setCreditId(Long creditId) {
        this.creditId = creditId;
    }

    public void setSerialNumber(String serialNumber) {
        this.serialNumber = serialNumber;
    }

    public void setOrganizationId(Long organizationId) {
        this.organizationId = organizationId;
    }

    public void setVerificationId(Long verificationId) {
        this.verificationId = verificationId;
    }

    public void setCreditAmount(BigDecimal creditAmount) {
        this.creditAmount = creditAmount;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public static class CreditIssuedEventBuilder {
        private Long creditId;
        private String serialNumber;
        private Long organizationId;
        private Long verificationId;
        private BigDecimal creditAmount;
        private String unit;
        private String eventType;

        public CreditIssuedEventBuilder creditId(Long creditId) {
            this.creditId = creditId;
            return this;
        }

        public CreditIssuedEventBuilder serialNumber(String serialNumber) {
            this.serialNumber = serialNumber;
            return this;
        }

        public CreditIssuedEventBuilder organizationId(Long organizationId) {
            this.organizationId = organizationId;
            return this;
        }

        public CreditIssuedEventBuilder verificationId(Long verificationId) {
            this.verificationId = verificationId;
            return this;
        }

        public CreditIssuedEventBuilder creditAmount(BigDecimal creditAmount) {
            this.creditAmount = creditAmount;
            return this;
        }

        public CreditIssuedEventBuilder unit(String unit) {
            this.unit = unit;
            return this;
        }

        public CreditIssuedEventBuilder eventType(String eventType) {
            this.eventType = eventType;
            return this;
        }

        public CreditIssuedEvent build() {
            return new CreditIssuedEvent(creditId, serialNumber, organizationId, verificationId, creditAmount, unit,
                    eventType);
        }
    }
}
