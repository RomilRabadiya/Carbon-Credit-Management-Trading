package com.carboncredit.verificationservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "verification_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VerificationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long reportId;

    @Column(nullable = false)
    private Long projectId;

    @Column(nullable = false)
    private Long organizationId;

    @Column(nullable = false)
    private String status; // PENDING, APPROVED, REJECTED

    private LocalDateTime verifiedAt;

    private BigDecimal carbonCreditsCalculated;

    private String remarks;

    @Column(nullable = false)
    private LocalDateTime createdAt;
}
