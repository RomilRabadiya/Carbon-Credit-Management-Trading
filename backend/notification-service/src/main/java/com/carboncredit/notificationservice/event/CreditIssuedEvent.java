package com.carboncredit.notificationservice.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreditIssuedEvent {
    private Long creditId;
    private Long projectId;
    private BigDecimal amount;
    private Long ownerId;
    private String eventType; // "CREDIT_ISSUED"
}
