package com.carboncredit.common.event;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class CreditRetiredEvent {
    private Long creditId;
    private Long ownerId;
    private String serialNumber;
    private String reason;
    private Long transactionId;
    private LocalDateTime timestamp;
    private String eventType;
}
