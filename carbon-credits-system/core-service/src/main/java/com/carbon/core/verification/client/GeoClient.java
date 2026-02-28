package com.carbon.core.verification.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import com.carbon.core.verification.dto.GeoAnalysisRequest;
import com.carbon.core.verification.dto.GeoAnalysisResult;

@FeignClient(name = "geo-service", url = "${geo-service.url:http://localhost:8001}")
public interface GeoClient {

    @PostMapping("/analyze")
    GeoAnalysisResult analyzeLand(@RequestBody GeoAnalysisRequest request);
}
