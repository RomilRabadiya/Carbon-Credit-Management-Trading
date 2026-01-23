package com.carboncredit.creditservice.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Kafka Event: CREDIT_ISSUED
 * 
 * Produced by: Credit Issuance Service
 * Consumed by: Trading Service, Audit Service, Notification Service
 * 
 * Published when credits are successfully issued to an organization
 * 
 * Contract:
 * - creditBatchId: Unique identifier for this batch of credits
 * - reportId: Source emission report
 * - organizationId: Organization that received the credits
 * - totalCreditsIssued: Total credits issued (typically equals
 * verifiedEmissionAmount)
 * - issuedAt: Timestamp of issuance
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreditIssuedEvent {

    /**
     * Unique batch identifier for this credit issuance
     */
    private String creditBatchId;

    /**
     * Source emission report ID
     */
    private Long reportId;

    /**
     * Organization that received the credits
     */
    private String organizationId;

    /**
     * Total amount of credits issued
     */
    private Double totalCreditsIssued;

    /**
     * Timestamp when credits were issued
     */
    private LocalDateTime issuedAt;
}
