package com.carboncredit.creditservice.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Kafka Event: CREDIT_ISSUANCE_FAILED
 * 
 * Produced by: Credit Issuance Service
 * Consumed by: Audit Service, Monitoring Service, Notification Service
 * 
 * Published when credit issuance fails due to business rule violations
 * 
 * Contract:
 * - reportId: Emission report for which issuance failed
 * - organizationId: Organization affected
 * - failureReason: Human-readable failure description
 * - errorCode: Machine-readable error code for categorization
 * - failedAt: Timestamp of failure
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreditIssuanceFailedEvent {

    /**
     * Emission report ID for which issuance failed
     */
    private Long reportId;

    /**
     * Organization that was supposed to receive credits
     */
    private String organizationId;

    /**
     * Human-readable failure reason
     */
    private String failureReason;

    /**
     * Machine-readable error code
     * Examples: DUPLICATE_ISSUANCE, INVALID_AMOUNT, DATABASE_ERROR
     */
    private String errorCode;

    /**
     * Timestamp when failure occurred
     */
    private LocalDateTime failedAt;
}
