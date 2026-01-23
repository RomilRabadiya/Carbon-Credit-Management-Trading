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
public class TradeExecutedEvent extends BaseEvent {
    private Long tradeId;
    private Long buyerOrgId;
    private Long sellerOrgId;
    private BigDecimal creditAmount;
    private BigDecimal pricePerCredit;
    private BigDecimal totalPrice;
}
