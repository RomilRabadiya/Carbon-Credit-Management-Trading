package com.carboncredit.verificationservice.service;

import com.carboncredit.common.event.VerificationCompletedEvent;
import com.carboncredit.verificationservice.model.VerificationRequest;
import com.carboncredit.verificationservice.repository.VerificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import com.carboncredit.verificationservice.client.CreditClient;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class VerificationService {

    private final VerificationRepository repository;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final CreditClient creditClient;
    private final com.carboncredit.verificationservice.client.EmissionClient emissionClient;
    private final com.carboncredit.verificationservice.client.GeoClient geoClient;

    /**
     * Kafka Consumer: Listens to emission-topic for new emission reports
     */
    @SuppressWarnings("null")
    public VerificationRequest createVerification(VerificationRequest request) {
        request.setStatus("PENDING");
        request.setCreatedAt(LocalDateTime.now());
        VerificationRequest saved = repository.save(request);
        log.info("Verification request created via API with ID: {}", saved.getId());
        return saved;
    }

    /**
     * Manually approve a verification request
     */
    @SuppressWarnings("null")
    public VerificationRequest approveVerification(Long id, String remarks) {
        VerificationRequest verification = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Verification not found"));

        if (!"PENDING".equals(verification.getStatus())) {
            throw new IllegalStateException("Verification is already " + verification.getStatus());
        }

        // 1. Fetch Emission Report Details (to get Lat/Lon)
        com.carboncredit.verificationservice.dto.EmissionReportDTO report = emissionClient
                .getEmissionReport(verification.getReportId());

        if (report.getLatitude() == null || report.getLongitude() == null) {
            throw new IllegalArgumentException("Emission Report is missing geolocation data. Cannot verify.");
        }

        // 2. Call Geo-Service for Satellite Analysis
        com.carboncredit.verificationservice.dto.GeoAnalysisRequest geoRequest = com.carboncredit.verificationservice.dto.GeoAnalysisRequest
                .builder()
                .projectId(verification.getProjectId())
                .lat(report.getLatitude())
                .lon(report.getLongitude())
                .buffer_m(5000)
                .build();

        com.carboncredit.verificationservice.dto.GeoAnalysisResult geoResult = geoClient.analyzeLand(geoRequest);
        log.info("Geo Analysis Result for Project {}: Status={}, Score={}",
                verification.getProjectId(), geoResult.getStatus(), geoResult.getNonGreenPercentage());

        // 3. Validate Result
        if ("FRAUD_RISK".equals(geoResult.getStatus()) || "HIGH_RISK".equals(geoResult.getStatus())) {
            verification.setStatus("REJECTED");
            verification.setRemarks("Auto-Rejected by Satellite Analysis: " + geoResult.getDetails());
            repository.save(verification);
            throw new IllegalStateException("Verification Rejected: " + geoResult.getDetails());
        }

        // 4. Calculate Credits (Backend Integrity)
        // If WARNING, apply 50% penalty. If VERIFIED, 100%.
        BigDecimal finalCredits = report.getCalculatedEmission();
        if ("WARNING".equals(geoResult.getStatus())) {
            finalCredits = finalCredits.multiply(new BigDecimal("0.5"));
            remarks += " [Penalty Applied: High Non-Green Area]";
        }

        // Ignore the frontend 'creditsCalculated' - we use our trusted source
        verification.setStatus("APPROVED");
        verification.setVerifiedAt(LocalDateTime.now());
        verification.setCarbonCreditsCalculated(finalCredits);
        verification.setRemarks(remarks + " [Geo-Verified]");

        VerificationRequest saved = repository.save(verification);
        log.info("Verification {} approved with {} credits", id, finalCredits);

        // Synchronous Credit Issuance
        try {
            log.info("Initiating synchronous credit issuance for Verification ID: {}", saved.getId());
            creditClient.issueCredits(Map.of(
                    "projectId", saved.getProjectId(),
                    "amount", saved.getCarbonCreditsCalculated(),
                    "ownerId", saved.getOrganizationId(),
                    "projectType", report.getProjectType(),
                    "latitude", report.getLatitude(),
                    "longitude", report.getLongitude())); // Pass lat/lon
            log.info("Credit issuance initiated successfully.");
        } catch (Exception e) {
            log.error("Failed to call Credit Issuance Service", e);
            throw new RuntimeException("Credit Issuance Failed", e);
        }

        emitVerificationCompletedEvent(saved, report.getProjectType(),
                report.getLatitude(), report.getLongitude());
        return saved;
    }

    /**
     * Manually reject a verification request
     */
    @SuppressWarnings("null")
    public VerificationRequest rejectVerification(Long id, String remarks) {
        VerificationRequest verification = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Verification not found"));

        if (!"PENDING".equals(verification.getStatus())) {
            throw new IllegalStateException("Verification is already " + verification.getStatus());
        }

        verification.setStatus("REJECTED");
        verification.setRemarks(remarks);
        verification.setVerifiedAt(LocalDateTime.now());

        VerificationRequest saved = repository.save(verification);
        log.info("Verification {} rejected. Reason: {}", id, remarks);

        return saved;
    }

    /**
     * Emit VerificationCompletedEvent to Kafka
     */
    private void emitVerificationCompletedEvent(VerificationRequest verification, String projectType,
            Double latitude, Double longitude) {
        VerificationCompletedEvent event = VerificationCompletedEvent.builder()
                .verificationId(verification.getId())
                .reportId(verification.getReportId())
                .projectId(verification.getProjectId())
                .organizationId(verification.getOrganizationId())
                .status(verification.getStatus())
                .carbonCreditsCalculated(verification.getCarbonCreditsCalculated())
                .remarks(verification.getRemarks())
                .projectType(projectType)
                .latitude(latitude)
                .longitude(longitude)
                .eventType("VERIFICATION_COMPLETED")
                .build();

        kafkaTemplate.send("EMISSION_VERIFIED", event);
        log.info("VerificationCompletedEvent sent to Kafka for verification ID: {}", verification.getId());
    }

    public List<VerificationRequest> getAllVerifications() {
        return repository.findAll();
    }

    @SuppressWarnings("null")
    public VerificationRequest getVerificationById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Verification not found"));
    }

    public List<VerificationRequest> getVerificationsByOrganization(Long orgId) {
        return repository.findByOrganizationId(orgId);
    }
}
