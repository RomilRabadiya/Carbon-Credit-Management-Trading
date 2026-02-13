package com.carboncredit.emissionservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportRequestDto {
    private Long projectId;
    private Long organizationId;
    private String projectType; // REFORESTATION, METHANE_CAPTURE
    private Map<String, Object> data;
    private String evidenceUrl;
    private Double latitude;
    private Double longitude;
}
