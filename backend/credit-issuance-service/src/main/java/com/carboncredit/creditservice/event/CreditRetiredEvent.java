package com.carboncredit.creditservice.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreditRetiredEvent {
    private Long creditId;
    private String serialNumber;
    private Long organizationId; // Owner who retired it
    private BigDecimal amount;
    private String beneficiary;
    private String reason;
    private LocalDateTime retirementDate;
    private String eventType; // CREDIT_RETIRED
}
