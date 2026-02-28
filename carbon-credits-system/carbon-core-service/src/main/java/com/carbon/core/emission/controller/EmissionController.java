package com.carbon.core.emission.controller;

import com.carbon.core.emission.dto.ReportRequestDto;
import com.carbon.core.emission.model.EmissionReport;
import com.carbon.core.emission.service.EmissionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/emissions")
public class EmissionController {

    private final EmissionService service;

    public EmissionController(EmissionService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEntity<EmissionReport> submitReport(
            @RequestHeader("X-User-Id") Long userId,
            @RequestBody ReportRequestDto request) {
        return ResponseEntity.ok(service.submitReport(userId, request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmissionReport> getEmissionReport(@PathVariable Long id) {
        return ResponseEntity.ok(service.getEmissionReport(id));
    }
}
