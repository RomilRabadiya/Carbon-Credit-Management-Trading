package com.carboncredit.tradingservice.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "trades")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Trade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long sellerId;

    @Column(nullable = true)
    private Long buyerId;

    @Column(nullable = false)
    private Long creditId;

    @Column(nullable = true)
    private BigDecimal pricePerUnit;

    @Column(nullable = true)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    private TradeStatus status; // PENDING, COMPLETED, CANCELLED

    @Column(nullable = false)
    private String transactionType; // TRADE, RETIRE

    private LocalDateTime transactionDate;
}
