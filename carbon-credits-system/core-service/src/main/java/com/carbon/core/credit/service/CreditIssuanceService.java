package com.carbon.core.credit.service;

import com.carbon.core.event.CreditIssuedEvent;
import com.carbon.core.credit.dao.CreditDAO;
import com.carbon.core.credit.dto.CarbonCreditDTO;
import com.carbon.core.credit.dto.CreditListResponseDTO;
import com.carbon.core.credit.model.CarbonCredit;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CreditIssuanceService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(CreditIssuanceService.class);

    private static final String STATUS_ACTIVE = "ACTIVE";
    private static final String STATUS_RETIRED = "RETIRED";

    private final CreditDAO creditDAO;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    public CreditIssuanceService(CreditDAO creditDAO,
            KafkaTemplate<String, Object> kafkaTemplate) {
        this.creditDAO = creditDAO;
        this.kafkaTemplate = kafkaTemplate;
    }

    @Value("${kafka.topic.credit-issued:credit-issued-topic}")
    private String creditIssuedTopic;

    // =========================================
    // ISSUE CREDITS DIRECTLY
    // =========================================
    @Transactional
    public void issueCredits(Long projectId,
            BigDecimal amount,
            Long ownerId,
            String projectType,
            Double latitude,
            Double longitude) {

        CarbonCredit credit = new CarbonCredit();
        credit.setSerialNumber(generateSerialNumber(projectId));
        credit.setAmount(amount);
        credit.setOwnerId(ownerId);
        credit.setProjectType(projectType);
        credit.setLatitude(latitude);
        credit.setLongitude(longitude);
        credit.setStatus(STATUS_ACTIVE);
        credit.setIssuanceDate(LocalDateTime.now());
        credit.setExpiryDate(LocalDateTime.now().plusYears(10));

        creditDAO.save(credit);
        log.info("Credits issued successfully: {}", credit.getId());

        CreditIssuedEvent event = CreditIssuedEvent.builder()
                .creditId(credit.getId())
                .creditAmount(amount)
                .organizationId(ownerId)
                .eventType("CREDIT_ISSUED")
                .build();

        try {
            kafkaTemplate.send(creditIssuedTopic, event);
        } catch (Exception e) {
            log.error("Failed to publish CreditIssuedEvent to Kafka for credit id: {}. Proceeding anyway. Error: {}",
                    credit.getId(), e.getMessage());
        }
    }

    // =========================================
    // FETCH CREDIT BY ID
    // =========================================
    @Transactional(readOnly = true)
    public CarbonCreditDTO getCreditById(Long id) {
        CarbonCredit credit = creditDAO.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Credit not found: " + id));
        return convertToDTO(credit);
    }

    // =========================================
    // FETCH CREDITS BY OWNER ID (userId or orgId — same field)
    // =========================================
    @Transactional(readOnly = true)
    public CreditListResponseDTO getCreditsByUser(Long userId) {
        List<CarbonCreditDTO> dtos = creditDAO.findByOwnerId(userId)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());

        return new CreditListResponseDTO(
                dtos,
                dtos.size(),
                "Successfully retrieved " + dtos.size() + " credits.");
    }

    // Keep for backwards compatibility
    @Transactional(readOnly = true)
    public CreditListResponseDTO getCreditsByOrganization(Long organizationId) {
        return getCreditsByUser(organizationId);
    }

    // =========================================
    // TRANSFER CREDIT
    // =========================================
    @Transactional
    public void transferCredit(Long creditId,
            Long currentOwnerId,
            Long newOwnerId) {

        CarbonCredit credit = creditDAO.findById(creditId)
                .orElseThrow(() -> new IllegalArgumentException("Credit not found: " + creditId));

        if (!credit.getOwnerId().equals(currentOwnerId)) {
            throw new IllegalArgumentException("Current owner mismatch.");
        }

        if (!STATUS_ACTIVE.equals(credit.getStatus())) {
            throw new IllegalStateException("Credit is not active.");
        }

        credit.setOwnerId(newOwnerId);
        creditDAO.save(credit);

        log.info("Credit {} transferred from {} to {}",
                creditId, currentOwnerId, newOwnerId);
    }

    // =========================================
    // RETIRE CREDIT
    // =========================================
    @Transactional
    public void retireCredit(Long creditId,
            String beneficiary,
            String reason) {

        CarbonCredit credit = creditDAO.findById(creditId)
                .orElseThrow(() -> new IllegalArgumentException("Credit not found: " + creditId));

        if (!STATUS_ACTIVE.equals(credit.getStatus())) {
            throw new IllegalStateException("Credit is not active.");
        }

        credit.setStatus(STATUS_RETIRED);
        credit.setRetirementBeneficiary(beneficiary);
        credit.setRetirementReason(reason);
        credit.setRetirementDate(LocalDateTime.now());

        creditDAO.save(credit);

        log.info("Credit {} retired successfully", creditId);
    }

    // =========================================
    // HELPER METHODS
    // =========================================
    private CarbonCreditDTO convertToDTO(CarbonCredit credit) {
        return new CarbonCreditDTO(
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

    private String generateSerialNumber(Long projectId) {
        int year = LocalDateTime.now().getYear();
        long sequence = System.currentTimeMillis() % 1000000; // simple unique-ish sequence
        return String.format("ISO-US-%d-%d-%06d", projectId != null ? projectId : 0, year, sequence);
    }
}
