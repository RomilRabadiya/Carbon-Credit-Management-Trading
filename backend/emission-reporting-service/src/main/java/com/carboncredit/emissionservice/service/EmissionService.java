package com.carboncredit.emissionservice.service;

import com.carboncredit.common.event.EmissionReportedEvent;
import com.carboncredit.emissionservice.dao.EmissionReportDAO;
import com.carboncredit.emissionservice.dto.ReportRequestDto;
import com.carboncredit.emissionservice.model.EmissionReport;
import com.carboncredit.emissionservice.strategy.EmissionCalculationStrategy;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
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
@RequiredArgsConstructor
@Slf4j
public class EmissionService {

    private final EmissionReportDAO emissionReportDAO;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final ObjectMapper objectMapper;
    private final Map<String, EmissionCalculationStrategy> strategyMap;

    public EmissionService(EmissionReportDAO emissionReportDAO,
            KafkaTemplate<String, Object> kafkaTemplate,
            ObjectMapper objectMapper,
            List<EmissionCalculationStrategy> strategies) {
        this.emissionReportDAO = emissionReportDAO;
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = objectMapper;
        this.strategyMap = strategies.stream()
                .collect(Collectors.toMap(EmissionCalculationStrategy::getProjectType, Function.identity()));
    }

    public EmissionReport submitReport(ReportRequestDto request) {
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
                .projectType(request.getProjectType())
                .emissionData(emissionDataJson)
                .calculatedEmission(calculatedEmission)
                .evidenceUrl(request.getEvidenceUrl())
                .status("PENDING_VERIFICATION")
                .createdAt(LocalDateTime.now())
                .build();

        EmissionReport savedReport = emissionReportDAO.save(report);
        log.info("Emission Report saved: {}", savedReport.getId());

        // Publish Event
        // Note: OrganizationID is missing in DTO for now, passing 0L or should be
        // fetched from context.
        // Assuming 1L for demo or needs to be added to DTO.
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
