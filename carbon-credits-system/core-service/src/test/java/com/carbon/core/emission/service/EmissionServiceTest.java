package com.carbon.core.emission.service;

import com.carbon.core.emission.dto.ReportRequestDto;
import com.carbon.core.emission.model.EmissionReport;
import com.carbon.core.emission.repository.EmissionReportRepository;
import com.carbon.core.event.EmissionReportedEvent;
import com.carbon.core.verification.repository.VerificationRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmissionServiceTest {

    @Mock
    private EmissionReportRepository repository;

    @Mock
    private KafkaTemplate<String, Object> kafkaTemplate;

    @Mock
    private VerificationRepository verificationRepository;

    private EmissionService emissionService;

    @BeforeEach
    void setUp() {
        emissionService = new EmissionService(repository, verificationRepository, kafkaTemplate);
        ReflectionTestUtils.setField(emissionService, "emissionReportedTopic", "emission-topic");
    }

    @Test
    void submitReport_PendingOrVerifiedExists_ThrowsException() {
        ReportRequestDto request = new ReportRequestDto();
        request.setProjectId(1L);

        when(repository.existsByProjectIdAndStatusIn(eq(1L), anyList()))
                .thenReturn(true);

        assertThrows(IllegalStateException.class, () -> emissionService.submitReport(100L, request));
    }

    @Test
    void submitReport_NoEvidence_ThrowsException() {
        ReportRequestDto request = new ReportRequestDto();
        request.setProjectId(1L);
        request.setEvidenceUrl(""); // Empty evidence

        when(repository.existsByProjectIdAndStatusIn(eq(1L), anyList())).thenReturn(false);

        assertThrows(IllegalArgumentException.class, () -> emissionService.submitReport(100L, request));
    }

    @Test
    void submitReport_Reforestation_Success() {
        ReportRequestDto request = new ReportRequestDto();
        request.setProjectId(1L);
        request.setProjectType("REFORESTATION");
        request.setUserId(123L);
        request.setEvidenceUrl("http://evidence.com");
        request.setAreaHectares(100.0);

        when(repository.existsByProjectIdAndStatusIn(eq(1L), anyList())).thenReturn(false);
        when(repository.save(any(EmissionReport.class))).thenAnswer(i -> {
            EmissionReport r = i.getArgument(0);
            r.setId(99L);
            return r;
        });

        EmissionReport report = emissionService.submitReport(123L, request);

        assertNotNull(report);
        assertEquals(BigDecimal.valueOf(1050.0), report.getCalculatedEmission());
        assertEquals("PENDING_VERIFICATION", report.getStatus());

        ArgumentCaptor<EmissionReportedEvent> eventCaptor = ArgumentCaptor.forClass(EmissionReportedEvent.class);
        verify(kafkaTemplate).send(eq("emission-topic"), eventCaptor.capture());

        EmissionReportedEvent event = eventCaptor.getValue();
        assertEquals(99L, event.getReportId());
        assertEquals(BigDecimal.valueOf(1050.0), event.getCarbonAmount());
    }

    @Test
    void getEmissionReport_NotFound_ThrowsException() {
        when(repository.findById(1L)).thenReturn(Optional.empty());
        assertThrows(IllegalArgumentException.class, () -> emissionService.getEmissionReport(1L));
    }
}
