package com.carboncredit.verificationservice.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class EmissionReportDTO {
    private Long id;
    private Long projectId;
    private Long organizationId;
    private String projectType;
    private BigDecimal calculatedEmission;
    private String evidenceUrl;
    private String status;
    private Double latitude;
    private Double longitude;
}
