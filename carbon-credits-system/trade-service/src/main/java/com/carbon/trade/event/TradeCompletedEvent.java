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
public class TradeCompletedEvent {
    private Long tradeId;
    private Long creditId;
    private Long sellerId;
    private Long buyerId;
    private BigDecimal pricePerUnit;
    private BigDecimal creditAmount;
    private LocalDateTime timestamp;
    private String eventType; // e.g., "TRADE_COMPLETED"
}
