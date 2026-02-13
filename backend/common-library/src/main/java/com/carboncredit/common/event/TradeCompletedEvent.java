package com.carboncredit.common.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TradeCompletedEvent {
    private UUID listingId;
    private Long buyerId;
    private Long sellerId;
    private Long creditId;
    private BigDecimal pricePerUnit;
    private LocalDateTime timestamp;
    private String eventType; // "TRADE_COMPLETED"
}
