package com.carbon.core.emission.model;

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
    private Long userId;

    @Column(nullable = false)
    private String projectType;

    private BigDecimal calculatedEmission;
    private String evidenceUrl;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    private String status;
    private LocalDateTime createdAt;
}
