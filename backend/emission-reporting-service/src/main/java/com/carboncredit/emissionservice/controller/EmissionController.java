package com.carboncredit.emissionservice.controller;

import com.carboncredit.common.dto.ResponseEnvelope;
import com.carboncredit.emissionservice.model.EmissionReport;
import com.carboncredit.emissionservice.service.EmissionService;
import com.carboncredit.emissionservice.dao.EmissionReportDAO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/emissions")
@RequiredArgsConstructor
public class EmissionController {

    private final EmissionService service;
    private final EmissionReportDAO emissionReportDAO;

    @PostMapping
    public ResponseEnvelope<EmissionReport> submitReport(
            @RequestBody com.carboncredit.emissionservice.dto.ReportRequestDto request) {
        return ResponseEnvelope.success(service.submitReport(request), "Emission report submitted successfully");
    }

    @SuppressWarnings("null")
    @GetMapping("/{id}")
    public EmissionReport getEmissionReport(@PathVariable Long id) {
        return emissionReportDAO.findById(id)
                .orElseThrow(() -> new RuntimeException("Emission Report not found: " + id));
    }
}
