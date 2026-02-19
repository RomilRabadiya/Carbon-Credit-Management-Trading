package com.carboncredit.creditservice.service;

import com.carboncredit.common.event.CreditIssuedEvent;
import com.carboncredit.common.event.VerificationCompletedEvent;
import com.carboncredit.creditservice.dao.CreditDAO;
import com.carboncredit.creditservice.model.CarbonCredit;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CreditIssuanceService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(CreditIssuanceService.class);

    private final CreditDAO creditDAO;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public CreditIssuanceService(CreditDAO creditDAO, KafkaTemplate<String, Object> kafkaTemplate) {
        this.creditDAO = creditDAO;
        this.kafkaTemplate = kafkaTemplate;
    }

    @Value("${kafka.topic.credit-issued}")
    private String creditIssuedTopic;

    @Transactional
    public void issueCredits(Long projectId, BigDecimal amount, Long ownerId, String projectType,
            Double latitude, Double longitude) {
        CarbonCredit credit = new CarbonCredit();
        credit.setAmount(amount);
        credit.setOwnerId(ownerId);
        credit.setProjectType(projectType);
        credit.setLatitude(latitude);
        credit.setLongitude(longitude);
        credit.setStatus("ACTIVE");
        credit.setIssuanceDate(LocalDateTime.now());
        credit.setExpiryDate(LocalDateTime.now().plusYears(10));

        creditDAO.save(credit);
        log.info("Credits issued successfully: {}", credit.getId());

        // Emit CreditIssuedEvent (Kafka) -> Notification Service listens to this!
        CreditIssuedEvent event = CreditIssuedEvent.builder()
                .creditId(credit.getId())
                .creditAmount(amount)
                .organizationId(ownerId)
                .eventType("CREDIT_ISSUED")
                .build();
        kafkaTemplate.send("credit-issued-topic", event);
    }

    // Keep this for backward compatibility or remove logic if fully migrated
    @SuppressWarnings("null")
    public void processVerificationEvent(VerificationCompletedEvent event) {
        log.info("Processing VerificationCompletedEvent for verificationId: {}", event.getVerificationId());

        if (!"APPROVED".equals(event.getStatus())) {
            log.info("Verification not approved (Status: {}). Skipping minting.", event.getStatus());
            return;
        }

        // Idempotency Check
        if (creditDAO.existsByVerificationId(event.getVerificationId())) {
            log.warn("Credits already minted for verificationId: {}", event.getVerificationId());
            return;
        }

        // Generate Serial Number
        String serialNumber = generateSerialNumber(event);

        CarbonCredit credit = new CarbonCredit();
        credit.setSerialNumber(serialNumber);
        credit.setVerificationId(event.getVerificationId());
        credit.setOwnerId(event.getOrganizationId());
        credit.setAmount(event.getCarbonCreditsCalculated());
        credit.setStatus("ACTIVE");
        credit.setIssuanceDate(LocalDateTime.now());
        credit.setExpiryDate(LocalDateTime.now().plusYears(10));
        credit.setProjectType(event.getProjectType()); // Set from Event
        credit.setLatitude(event.getLatitude());
        credit.setLongitude(event.getLongitude());

        creditDAO.save(credit);
        log.info("Minted Carbon Credit: {} for Owner: {}", serialNumber, event.getOrganizationId());

        // Publish Credit Issued Event
        CreditIssuedEvent issuedEvent = CreditIssuedEvent.builder()
                .creditId(credit.getId())
                .serialNumber(credit.getSerialNumber())
                .organizationId(credit.getOwnerId())
                .verificationId(credit.getVerificationId())
                .creditAmount(credit.getAmount())
                .unit("TONNE_CO2E")
                .eventType("CREDIT_ISSUED")
                .build();

        kafkaTemplate.send(creditIssuedTopic, issuedEvent);
    }

    @Transactional(readOnly = true)
    @SuppressWarnings("null")
    public com.carboncredit.creditservice.dto.CarbonCreditDTO getCreditById(Long id) {
        return creditDAO.findById(id)
                .map(this::convertToDTO)
                .orElseThrow(() -> new IllegalArgumentException("Credit not found: " + id));
    }

    @Transactional(readOnly = true)
    @SuppressWarnings("null")
    public com.carboncredit.creditservice.dto.CreditListResponseDTO getCreditsByOrganization(String organizationId) {
        java.util.List<com.carboncredit.creditservice.dto.CarbonCreditDTO> dtos = creditDAO.findAll().stream()
                .filter(c -> c.getOwnerId() != null && c.getOwnerId().toString().equals(organizationId))
                .map(this::convertToDTO)
                .collect(java.util.stream.Collectors.toList());

        return new com.carboncredit.creditservice.dto.CreditListResponseDTO(
                dtos,
                dtos.size(),
                "Successfully retrieved " + dtos.size() + " credits.");
    }

    private com.carboncredit.creditservice.dto.CarbonCreditDTO convertToDTO(CarbonCredit credit) {
        return new com.carboncredit.creditservice.dto.CarbonCreditDTO(
                credit.getId(),
                credit.getSerialNumber(),
                credit.getOwnerId(),
                credit.getAmount(),
                credit.getStatus(),
                credit.getVerificationId(),
                credit.getIssuanceDate(),
                credit.getProjectType(),
                credit.getLatitude(),
                credit.getLongitude());
    }

    @SuppressWarnings("null")
    public void retireCredit(Long creditId, String beneficiary, String reason) {
        CarbonCredit credit = creditDAO.findById(creditId)
                .orElseThrow(() -> new IllegalArgumentException("Credit not found: " + creditId));

        if (!"ACTIVE".equals(credit.getStatus())) {
            throw new IllegalStateException(
                    "Credit is not active and cannot be retired. Current status: " + credit.getStatus());
        }

        credit.setStatus("RETIRED");
        credit.setRetirementBeneficiary(beneficiary);
        credit.setRetirementReason(reason);
        credit.setRetirementDate(LocalDateTime.now());

        creditDAO.save(credit);
        log.info("Retired credit {} for benificiary '{}' (Reason: {})", creditId, beneficiary, reason);

        // Optionally emit an event here if needed
    }

    private String generateSerialNumber(VerificationCompletedEvent event) {
        // Standard: ISO-Country-ProjectID-Year-Sequence
        // Example: ISO-US-1001-2026-000001
        String country = "US"; // Default or fetch from project
        long projectId = event.getProjectId();
        int year = LocalDateTime.now().getYear();
        long sequence = creditDAO.count() + 1;

        return String.format("ISO-%s-%d-%d-%06d", country, projectId, year, sequence);
    }

    @Transactional
    @SuppressWarnings("null")
    public void transferCredit(Long creditId, Long currentOwnerId, Long newOwnerId) {
        CarbonCredit credit = creditDAO.findById(creditId)
                .orElseThrow(() -> new IllegalArgumentException("Credit not found: " + creditId));

        if (!credit.getOwnerId().equals(currentOwnerId)) {
            throw new IllegalArgumentException("Current owner does not match. Transfer denied.");
        }

        if (!"ACTIVE".equals(credit.getStatus())) {
            throw new IllegalStateException("Credit is not active (Status: " + credit.getStatus() + ")");
        }

        log.info("Transferring credit {} from owner {} to owner {}", creditId, currentOwnerId, newOwnerId);
        credit.setOwnerId(newOwnerId);
        creditDAO.save(credit);
    }
}
