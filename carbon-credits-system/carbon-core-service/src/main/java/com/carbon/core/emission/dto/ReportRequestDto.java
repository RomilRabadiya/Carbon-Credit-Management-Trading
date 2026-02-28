package com.carbon.core.emission.dto;

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
    private Long userId;
    private String projectType;
    private Double areaHectares;
    private Double volumeM3;
    private String evidenceUrl;
    private Double latitude;
    private Double longitude;
}
