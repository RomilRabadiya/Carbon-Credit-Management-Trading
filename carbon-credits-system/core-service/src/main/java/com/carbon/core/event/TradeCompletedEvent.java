package com.carbon.core.event;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class TradeCompletedEvent {
    private Long listingId;
    private Long buyerId;
    private Long sellerId;
    private Long creditId;
    private BigDecimal pricePerUnit;
    private LocalDateTime timestamp;
    private String eventType;
}
