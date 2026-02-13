package com.carboncredit.emissionservice.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmissionReportedEvent {
    private String eventId;
    private Long reportId;
    private Long projectId;
    private Long organizationId;
    private BigDecimal carbonAmount;
    private String unit; // e.g., "TONNE_CO2E"
    private String description;
    private String eventType; // "EMISSION_REPORTED"
}
