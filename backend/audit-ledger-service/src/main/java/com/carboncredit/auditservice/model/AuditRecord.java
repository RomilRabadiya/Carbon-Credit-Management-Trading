package com.carboncredit.auditservice.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_records", indexes = {
        @Index(name = "idx_serial_number", columnList = "serialNumber"),
        @Index(name = "idx_entity_id", columnList = "entityId")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String eventType; // EMISSION_REPORTED, VERIFICATION_COMPLETED, CREDIT_ISSUED, CREDIT_RETIRED

    private String entityId; // e.g., Report ID, Verification ID, Credit ID

    private String serialNumber; // The Credit Serial Number (if applicable)

    @Column(columnDefinition = "TEXT")
    private String details; // JSON payload details

    private String actor; // Organization ID or User ID

    private LocalDateTime timestamp;
}
