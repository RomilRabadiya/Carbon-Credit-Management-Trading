package com.carboncredit.emissionservice.service;

import com.carboncredit.common.event.EmissionReportedEvent;
import com.carboncredit.emissionservice.dao.EmissionReportDAO;
import com.carboncredit.emissionservice.dto.ReportRequestDto;
import com.carboncredit.emissionservice.model.EmissionReport;
import com.carboncredit.emissionservice.strategy.EmissionCalculationStrategy;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Slf4j
public class EmissionService {

    private final EmissionReportDAO emissionReportDAO;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final ObjectMapper objectMapper;
    private final Map<String, EmissionCalculationStrategy> strategyMap;
    private final com.carboncredit.emissionservice.client.VerificationClient verificationClient;

    // Lombok's RequiredArgsConstructor will handle injection of final fields.
    // We need to initialize the map, though.
    // Actually, it's better to inject the list and convert it.
    // But since `strategyMap` is final, we can't assign it in PostConstruct easily
    // without removing final.
    // Let's keep it final and use constructor injection manually but cleaner.

    public EmissionService(EmissionReportDAO emissionReportDAO,
            KafkaTemplate<String, Object> kafkaTemplate,
            ObjectMapper objectMapper,
            List<EmissionCalculationStrategy> strategies,
            com.carboncredit.emissionservice.client.VerificationClient verificationClient) {
        this.emissionReportDAO = emissionReportDAO;
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = objectMapper;
        this.verificationClient = verificationClient;
        this.strategyMap = strategies.stream()
                .collect(Collectors.toMap(EmissionCalculationStrategy::getProjectType, Function.identity()));
    }

    @SuppressWarnings("null")
    public EmissionReport submitReport(ReportRequestDto request) {
        // DUPLICATE CHECK: Don't allow submission if one is already pending or verified
        if (emissionReportDAO.existsByProjectIdAndStatusIn(
                request.getProjectId(),
                java.util.List.of("PENDING_VERIFICATION", "VERIFIED"))) {
            throw new IllegalStateException(
                    "A report for Project ID " + request.getProjectId() + " is already Pending or Verified.");
        }

        // MRV Logic: Evidence is mandatory
        if (request.getEvidenceUrl() == null || request.getEvidenceUrl().isEmpty()) {
            throw new IllegalArgumentException(
                    "MRV Violation: Monitoring evidence is required for emission reporting.");
        }

        EmissionCalculationStrategy strategy = strategyMap.get(request.getProjectType());
        if (strategy == null) {
            throw new IllegalArgumentException("Invalid or unsupported Project Type: " + request.getProjectType());
        }

        BigDecimal calculatedEmission = strategy.calculateEmission(request.getData());

        String emissionDataJson;
        try {
            emissionDataJson = objectMapper.writeValueAsString(request.getData());
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error serializing emission data", e);
        }

        EmissionReport report = EmissionReport.builder()
                .projectId(request.getProjectId())
                .organizationId(request.getOrganizationId())
                .projectType(request.getProjectType())
                .emissionData(emissionDataJson)
                .calculatedEmission(calculatedEmission)
                .evidenceUrl(request.getEvidenceUrl())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .status("PENDING_VERIFICATION")
                .createdAt(LocalDateTime.now())
                .build();

        EmissionReport savedReport = emissionReportDAO.save(report);
        log.info("Emission Report saved: {}", savedReport.getId());

        // Synchronous Verification Call (Feign)
        // Creating Map payload similar to what DTO expects
        Map<String, Object> verificationPayload = Map.of(
                "reportId", savedReport.getId(),
                "projectId", savedReport.getProjectId(),
                "organizationId", savedReport.getOrganizationId() != null ? savedReport.getOrganizationId() : 0L);
        try {
            verificationClient.initiateVerification(verificationPayload);
            log.info("Verification initiated validation via Feign Client for Report ID: {}", savedReport.getId());
        } catch (Exception e) {
            log.error("Failed to initiate verification via Feign", e);
            // Non-blocking for now, or throw exception depending on business requirement
        }

        // Publish Event (Notification Only now)
        EmissionReportedEvent event = EmissionReportedEvent.builder()
                .reportId(savedReport.getId())
                .projectId(savedReport.getProjectId())
                .organizationId(request.getOrganizationId())
                .carbonAmount(savedReport.getCalculatedEmission())
                .unit("TONNE_CO2E")
                .description("Emission Report for Project " + savedReport.getProjectId())
                .eventType("EMISSION_REPORTED")
                .build();

        kafkaTemplate.send("emission-topic", event);
        log.info("EmissionReportedEvent sent for Report ID: {}", savedReport.getId());

        return savedReport;
    }
}
