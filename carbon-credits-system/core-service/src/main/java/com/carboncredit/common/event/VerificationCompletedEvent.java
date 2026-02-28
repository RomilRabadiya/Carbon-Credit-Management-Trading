package com.carboncredit.common.event;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
public class VerificationCompletedEvent {
    private Long verificationId;
    private Long reportId;
    private Long projectId;
    private Long organizationId;
    private String status;
    private BigDecimal carbonCreditsCalculated;
    private String remarks;
    private String projectType;
    private Double latitude;
    private Double longitude;
    private String eventType;
}
