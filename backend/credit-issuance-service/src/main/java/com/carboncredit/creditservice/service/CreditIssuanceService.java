package com.carboncredit.creditservice.service;

import com.carboncredit.common.event.CreditIssuedEvent;
import com.carboncredit.common.event.VerificationCompletedEvent;
import com.carboncredit.creditservice.dao.CreditDAO;
import com.carboncredit.creditservice.model.CarbonCredit;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class CreditIssuanceService {

    private final CreditDAO creditDAO;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${kafka.topic.credit-issued}")
    private String creditIssuedTopic;

    @Transactional
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

        CarbonCredit credit = CarbonCredit.builder()
                .serialNumber(serialNumber)
                .verificationId(event.getVerificationId())
                .ownerId(event.getOrganizationId())
                .amount(event.getCarbonCreditsCalculated())
                .status("ACTIVE") // Default status
                .issuanceDate(LocalDateTime.now())
                .build();

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
    public com.carboncredit.creditservice.dto.CarbonCreditDTO getCreditById(Long id) {
        return creditDAO.findById(id)
                .map(this::convertToDTO)
                .orElseThrow(() -> new IllegalArgumentException("Credit not found: " + id));
    }

    @Transactional(readOnly = true)
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
        return com.carboncredit.creditservice.dto.CarbonCreditDTO.builder()
                .id(credit.getId())
                .serialNumber(credit.getSerialNumber())
                .ownerId(credit.getOwnerId())
                .amount(credit.getAmount())
                .status(credit.getStatus())
                .verificationId(credit.getVerificationId())
                .issuanceDate(credit.getIssuanceDate())
                .build();
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
}
