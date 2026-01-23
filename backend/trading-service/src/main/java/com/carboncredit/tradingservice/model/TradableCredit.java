package com.carboncredit.tradingservice.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;

/**
 * Local replica of CarbonCredit for trading purposes.
 * Allows locking and efficient querying without calling Credit Service.
 */
@Entity
@Table(name = "tradable_credits")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TradableCredit {

    @Id
    private Long id; // Matches Credit ID from Credit Service

    @Column(nullable = false, unique = true)
    private String serialNumber;

    @Column(nullable = false)
    private Long ownerId;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(nullable = false)
    private String status; // ACTIVE, RETIRED
}
