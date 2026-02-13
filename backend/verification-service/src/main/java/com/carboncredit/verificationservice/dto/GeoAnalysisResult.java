package com.carboncredit.verificationservice.dto;

import lombok.Data;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
public class GeoAnalysisResult {
    private Long projectId;
    private Double lat;
    private Double lon;

    @JsonProperty("non_green_percentage")
    private Double nonGreenPercentage;

    // VERIFIED, WARNING, HIGH_RISK, FRAUD_RISK
    private String status;

    private String details;
}
