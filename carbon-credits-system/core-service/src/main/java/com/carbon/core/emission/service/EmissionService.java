package com.carbon.core.emission.service;

import com.carbon.core.emission.dto.ReportRequestDto;
import com.carbon.core.emission.model.EmissionReport;
import com.carbon.core.emission.repository.EmissionReportRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Service
public class EmissionService {

    private final EmissionReportRepository repository;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${kafka.topic.emission-reported:emission-topic}")
    private String emissionReportedTopic;

    public EmissionService(EmissionReportRepository repository, KafkaTemplate<String, Object> kafkaTemplate) {
        this.repository = repository;
        this.kafkaTemplate = kafkaTemplate;
    }

    public EmissionReport getEmissionReport(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Emission Report not found: " + id));
    }

    public EmissionReport submitReport(Long userId, ReportRequestDto request) {
        Long projectId = request.getProjectId();
        if (projectId == null || projectId <= 0) {
            projectId = (long) (Math.random() * 900000) + 100000;
        }

        if (repository.existsByProjectIdAndStatusIn(projectId,
                java.util.List.of("PENDING_VERIFICATION", "VERIFIED"))) {
            throw new IllegalStateException(
                    "A report for Project ID " + projectId + " is already Pending or Verified.");
        }

        BigDecimal calculatedEmission = calculateEmission(request);

        EmissionReport report = EmissionReport.builder()
                .projectId(projectId)
                .userId(userId)
                .projectType(request.getProjectType())
                .calculatedEmission(calculatedEmission)
                .evidenceUrl(request.getEvidenceUrl())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .status("PENDING_VERIFICATION")
                .createdAt(LocalDateTime.now())
                .build();

        EmissionReport saved = repository.save(report);

        try {
            com.carbon.core.event.EmissionReportedEvent event = com.carbon.core.event.EmissionReportedEvent.builder()
                    .reportId(saved.getId())
                    .projectId(saved.getProjectId())
                    .userId(saved.getUserId())
                    .carbonAmount(saved.getCalculatedEmission())
                    .unit("TONNE_CO2E")
                    .description("Emission Report for Project " + saved.getProjectId())
                    .eventType("EMISSION_REPORTED")
                    .build();
            kafkaTemplate.send(emissionReportedTopic, event);
        } catch (Exception e) {
            System.err.println(
                    "Warning: Failed to send Kafka event for report ID: " + saved.getId() + " - " + e.getMessage());
        }

        return saved;
    }

    private BigDecimal calculateEmission(ReportRequestDto request) {
        String projectType = request.getProjectType();
        if (projectType == null) {
            throw new IllegalArgumentException("Project type is required");
        }
        switch (projectType.toUpperCase()) {
            case "REFORESTATION": {
                Double area = request.getAreaHectares();
                if (area == null)
                    throw new IllegalArgumentException("Reforestation requires areaHectares");
                return BigDecimal.valueOf(area * 10.5);
            }
            case "METHANE_CAPTURE": {
                Double volume = request.getVolumeM3();
                if (volume == null)
                    throw new IllegalArgumentException("Methane capture requires volumeM3");
                return BigDecimal.valueOf(volume * 0.015);
            }
            default:
                throw new IllegalArgumentException("Unsupported project type: " + projectType);
        }
    }
}
