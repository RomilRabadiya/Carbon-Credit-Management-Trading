package com.carboncredit.common.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class VerificationCompletedEvent extends BaseEvent {
    private Long verificationId;
    private Long reportId;
    private Long projectId;
    private Long organizationId;
    private Long verifierId;
    private String status; // APPROVED, REJECTED
    private BigDecimal carbonCreditsCalculated;
    private String remarks;
}
