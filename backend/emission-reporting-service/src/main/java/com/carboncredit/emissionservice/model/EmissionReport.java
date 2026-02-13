package com.carboncredit.emissionservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "emission_reports")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmissionReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long projectId;

    private Long organizationId;

    @Column(nullable = false)
    private String projectType; // REFORESTATION, METHANE_CAPTURE

    @Column(columnDefinition = "jsonb")
    private String emissionData; // Serialized JSON

    private BigDecimal calculatedEmission;

    private String evidenceUrl;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    private String status; // PENDING_VERIFICATION, VERIFIED, REJECTED

    private LocalDateTime createdAt;
}
