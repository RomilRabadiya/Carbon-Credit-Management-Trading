package com.carbon.audit.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_logs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String transactionId;
    
    @Column(nullable = false)
    private LocalDateTime timestamp;
    
    @Column(nullable = false)
    private String transactionType; // e.g., CREDIT_ISSUED, TRADE, RETIRE, EMISSION_REPORTED
    
    private Long sourceOrganizationId;
    private Long destinationOrganizationId;
    
    @Column(precision = 19, scale = 4)
    private BigDecimal creditAmount;
    
    @Column(nullable = false)
    private String status; // e.g., COMPLETED, PENDING, FAILED
    
    @Column(columnDefinition = "TEXT")
    private String remarks;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        if (this.timestamp == null) {
            this.timestamp = LocalDateTime.now();
        }
    }
}
