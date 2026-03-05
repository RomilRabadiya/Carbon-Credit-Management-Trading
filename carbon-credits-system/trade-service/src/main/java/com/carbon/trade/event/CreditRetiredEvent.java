package com.carbon.trade.event;

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
    private Long organizationId;
    private BigDecimal creditAmount;
    private String beneficiary;
    private String reason;
    private LocalDateTime timestamp;
    private String eventType; // e.g., "CREDIT_RETIRED"
}
