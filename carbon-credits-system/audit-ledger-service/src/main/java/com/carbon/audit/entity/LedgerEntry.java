package com.carbon.audit.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "ledger_entries")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LedgerEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long organizationId;

    @Column(precision = 19, scale = 4)
    private BigDecimal debit; // Credits coming out of account

    @Column(precision = 19, scale = 4)
    private BigDecimal credit; // Credits going into account

    private String description;
    
    @Column(nullable = false)
    private LocalDateTime entryDate;
    
    private String reference; // Links to credit/trade ID

    @PrePersist
    protected void onCreate() {
        if (this.entryDate == null) {
            this.entryDate = LocalDateTime.now();
        }
    }
}
