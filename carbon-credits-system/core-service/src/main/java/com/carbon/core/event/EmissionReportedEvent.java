package com.carbon.core.event;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class EmissionReportedEvent {
    private Long reportId;
    private Long projectId;
    private Long userId;
    private Long organizationId; // Added: used by NotificationEventListener to route WS push
    private BigDecimal carbonAmount;
    private String unit;
    private String description;
    private String eventType;
    private LocalDateTime timestamp;
}
