package com.carboncredit.verificationservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import com.carboncredit.verificationservice.dto.GeoAnalysisRequest;
import com.carboncredit.verificationservice.dto.GeoAnalysisResult;

@FeignClient(name = "geo-service", url = "${geo-service.url:http://localhost:8001}")
public interface GeoClient {

    @PostMapping("/analyze")
    GeoAnalysisResult analyzeLand(@RequestBody GeoAnalysisRequest request);
}
