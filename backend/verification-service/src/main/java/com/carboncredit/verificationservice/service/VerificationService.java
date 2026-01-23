package com.carboncredit.verificationservice.service;

import com.carboncredit.common.event.EmissionReportedEvent;
import com.carboncredit.common.event.VerificationCompletedEvent;
import com.carboncredit.verificationservice.model.VerificationRequest;
import com.carboncredit.verificationservice.repository.VerificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class VerificationService {

    private final VerificationRepository repository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    /**
     * Kafka Consumer: Listens to emission-topic for new emission reports
     */
    @KafkaListener(topics = "emission-topic", groupId = "verification-group")
    public void consumeEmissionEvent(EmissionReportedEvent event) {
        log.info("Verification Service received Emission Reported Event");
        log.info("Report ID: {}, Org ID: {}, Carbon Amount: {} {}",
                event.getReportId(), event.getOrganizationId(),
                event.getCarbonAmount(), event.getUnit());

        // Create verification request
        VerificationRequest verification = new VerificationRequest();
        verification.setReportId(event.getReportId());
        verification.setProjectId(event.getProjectId());
        verification.setOrganizationId(event.getOrganizationId());
        verification.setStatus("PENDING");
        verification.setCreatedAt(LocalDateTime.now());

        VerificationRequest saved = repository.save(verification);
        log.info("Verification request created with ID: {} (Status: PENDING)", saved.getId());
    }

    /**
     * Manually approve a verification request
     */
    public VerificationRequest approveVerification(Long id, BigDecimal creditsCalculated, String remarks) {
        VerificationRequest verification = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Verification not found"));

        verification.setStatus("APPROVED");
        verification.setVerifiedAt(LocalDateTime.now());
        verification.setCarbonCreditsCalculated(creditsCalculated);
        verification.setRemarks(remarks);

        VerificationRequest saved = repository.save(verification);
        log.info("Verification {} manually approved", id);

        // Emit event
        emitVerificationCompletedEvent(saved);

        return saved;
    }

    /**
     * Emit VerificationCompletedEvent to Kafka
     */
    private void emitVerificationCompletedEvent(VerificationRequest verification) {
        VerificationCompletedEvent event = VerificationCompletedEvent.builder()
                .verificationId(verification.getId())
                .reportId(verification.getReportId())
                .projectId(verification.getProjectId())
                .organizationId(verification.getOrganizationId())
                .status(verification.getStatus())
                .carbonCreditsCalculated(verification.getCarbonCreditsCalculated())
                .remarks(verification.getRemarks())
                .eventType("VERIFICATION_COMPLETED")
                .build();

        kafkaTemplate.send("EMISSION_VERIFIED", event);
        log.info("VerificationCompletedEvent sent to Kafka for verification ID: {}", verification.getId());
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
