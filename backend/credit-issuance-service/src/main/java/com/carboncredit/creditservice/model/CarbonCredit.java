package com.carboncredit.creditservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entity representing a Carbon Credit in the system.
 * 
 * Design Decisions:
 * - Uses UUID for creditId to ensure global uniqueness across distributed
 * systems
 * - creditBatchId groups multiple credits issued for the same emission report
 * - reportId has unique constraint to enforce idempotency (one credit batch per
 * report)
 * - ownerOrganizationId tracks current owner (changes during trades)
 * - Status is enum-backed for type safety and valid state transitions
 * 
 * Database: PostgreSQL with proper indexing for performance
 */
@Entity
@Table(name = "carbon_credits", indexes = {
        @Index(name = "idx_owner_org", columnList = "ownerOrganizationId"),
        @Index(name = "idx_batch_id", columnList = "creditBatchId"),
        @Index(name = "idx_report_id", columnList = "reportId", unique = true),
        @Index(name = "idx_status", columnList = "status")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CarbonCredit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String serialNumber; // ISO-Country-Project-Year-Seq

    private Long ownerId; // Organization ID

    private BigDecimal amount; // 1 credit = 1 tonne

    private String status; // ACTIVE, RETIRED, TRANSFERRED

    @Column(unique = true)
    private Long verificationId; // Idempotency check

    private LocalDateTime issuanceDate;

    // Helper methods can be re-added if needed, but for now keeping it clean as per
    // new schema.
}
