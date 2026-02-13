package com.carboncredit.emissionservice.controller;

import com.carboncredit.common.dto.ResponseEnvelope;
import com.carboncredit.emissionservice.model.EmissionReport;
import com.carboncredit.emissionservice.service.EmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/emissions")
@RequiredArgsConstructor
public class EmissionController {

    private final EmissionService service;

    @PostMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('COMPANY')")
    public ResponseEnvelope<EmissionReport> submitReport(
            @RequestBody com.carboncredit.emissionservice.dto.ReportRequestDto request) {
        return ResponseEnvelope.success(service.submitReport(request), "Emission report submitted successfully");
    }
}
