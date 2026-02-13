package com.carboncredit.verificationservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GeoAnalysisRequest {
    private Long projectId;
    private Double lat;
    private Double lon;
    private Integer buffer_m;
}
