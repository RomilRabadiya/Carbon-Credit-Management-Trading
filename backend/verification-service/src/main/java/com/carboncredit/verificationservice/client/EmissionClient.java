package com.carboncredit.verificationservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import com.carboncredit.verificationservice.dto.EmissionReportDTO;

@FeignClient(name = "emission-reporting-service")
public interface EmissionClient {

    @GetMapping("/api/emissions/{id}")
    EmissionReportDTO getEmissionReport(@PathVariable("id") Long id);
}
