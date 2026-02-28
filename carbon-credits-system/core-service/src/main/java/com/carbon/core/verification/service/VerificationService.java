package com.carbon.core.verification.service;

import com.carbon.core.credit.service.CreditIssuanceService;
import com.carbon.core.emission.model.EmissionReport;
import com.carbon.core.emission.service.EmissionService;
import com.carbon.core.verification.model.VerificationRequest;
import com.carbon.core.verification.repository.VerificationRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.beans.factory.annotation.Value;

import com.carbon.core.event.VerificationCompletedEvent;
import com.carbon.core.verification.client.GeoClient;
import com.carbon.core.verification.dto.GeoAnalysisRequest;
import com.carbon.core.verification.dto.GeoAnalysisResult;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class VerificationService {

    private final VerificationRepository repository;
    private final CreditIssuanceService creditService;
    private final EmissionService emissionService;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    // Optional — GeoService may not be running; we handle failure gracefully
    @Autowired(required = false)
    private GeoClient geoClient;

    @Value("${kafka.topic.verification-completed:EMISSION_VERIFIED}")
    private String verificationCompletedTopic;

    @Transactional
    public VerificationRequest createVerification(VerificationRequest request) {
        request.setStatus("PENDING");
        request.setCreatedAt(LocalDateTime.now());
        return repository.save(request);
    }

    @Transactional
    public VerificationRequest approveVerification(Long id, String remarks) {

        VerificationRequest verification = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Verification not found"));

        if (!"PENDING".equals(verification.getStatus())) {
            throw new IllegalStateException("Verification is already " + verification.getStatus());
        }

        EmissionReport report = emissionService.getEmissionReport(verification.getReportId());

        // Optional: Call GeoService to verify land properties (non-blocking if it
        // fails)
        if (geoClient != null) {
            try {
                GeoAnalysisRequest geoReq = GeoAnalysisRequest.builder()
                        .projectId(verification.getProjectId())
                        .lat(report.getLatitude())
                        .lon(report.getLongitude())
                        .buffer_m(50)
                        .build();
                GeoAnalysisResult geoRes = geoClient.analyzeLand(geoReq);
                log.info("GeoService Response: {}", geoRes);
            } catch (Exception e) {
                log.warn("GeoService call failed. Ignoring. Error: {}", e.getMessage());
            }
        } else {
            log.info("GeoClient not available (geo-service not running). Skipping geo check.");
        }

        verification.setStatus("APPROVED");
        verification.setVerifiedAt(LocalDateTime.now());
        verification.setCarbonCreditsCalculated(report.getCalculatedEmission());
        verification.setRemarks(remarks);

        VerificationRequest saved = repository.save(verification);

        // Direct credit minting (clean, simple)
        creditService.issueCredits(
                saved.getProjectId(),
                saved.getCarbonCreditsCalculated(),
                saved.getOrganizationId(),
                report.getProjectType(),
                report.getLatitude(),
                report.getLongitude());

        // Publish event for Notification Service (wrapped in try-catch so it doesn't
        // fail the transaction)
        try {
            VerificationCompletedEvent event = VerificationCompletedEvent.builder()
                    .verificationId(saved.getId())
                    .reportId(report.getId())
                    .projectId(saved.getProjectId())
                    .organizationId(saved.getOrganizationId())
                    .status(saved.getStatus())
                    .carbonCreditsCalculated(saved.getCarbonCreditsCalculated())
                    .remarks(saved.getRemarks())
                    .projectType(report.getProjectType())
                    .latitude(report.getLatitude())
                    .longitude(report.getLongitude())
                    .eventType("VERIFICATION_COMPLETED")
                    .build();
            kafkaTemplate.send(verificationCompletedTopic, event);
        } catch (Exception e) {
            log.error("Failed to send VerificationCompletedEvent to Kafka. Continuing anyway. Error: {}",
                    e.getMessage());
        }

        return saved;
    }

    @Transactional
    public VerificationRequest rejectVerification(Long id, String remarks) {

        VerificationRequest verification = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Verification not found"));

        if (!"PENDING".equals(verification.getStatus())) {
            throw new IllegalStateException("Verification is already " + verification.getStatus());
        }

        verification.setStatus("REJECTED");
        verification.setRemarks(remarks);
        verification.setVerifiedAt(LocalDateTime.now());

        return repository.save(verification);
    }

    public List<VerificationRequest> getAllVerifications() {
        return repository.findAll();
    }

    public VerificationRequest getVerificationById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Verification not found"));
    }

    public List<VerificationRequest> getVerificationsByOrganization(Long orgId) {
        return repository.findByOrganizationId(orgId);
    }
}
