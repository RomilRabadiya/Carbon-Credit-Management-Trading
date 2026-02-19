package com.carboncredit.organizationservice.controller;

import com.carboncredit.common.dto.ResponseEnvelope;
import com.carboncredit.organizationservice.model.Organization;
import com.carboncredit.organizationservice.service.OrganizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/organizations")
@RequiredArgsConstructor
public class OrganizationController {

    private final OrganizationService service;

    @PostMapping
    public ResponseEnvelope<Organization> registerOrganization(@RequestBody Organization org) {
        Organization savedOrg = service.registerOrganization(org);
        return ResponseEnvelope.success(savedOrg, "Organization registered successfully");
    }

    @GetMapping("/{id}")
    public ResponseEnvelope<Organization> getOrganization(@PathVariable Long id) {
        return ResponseEnvelope.success(service.getOrganization(id), "Organization found");
    }

    @GetMapping
    public ResponseEnvelope<List<Organization>> getAll() {
        return ResponseEnvelope.success(service.getAllOrganizations(), "Organizations retrieved");
    }

    @PostMapping("/{id}/balance/deduct")
    // Secured: Only Internal Service (Trading) or Admin should call this.
    // For now, leaving loosely guarded or use a "SYSTEM" role if available.
    public ResponseEnvelope<Void> deductBalance(@PathVariable Long id, @RequestBody java.math.BigDecimal amount) {
        service.deductBalance(id, amount);
        return ResponseEnvelope.success(null, "Balance deducted");
    }

    @PostMapping("/{id}/balance/add")
    // Gateway handles authentication
    public ResponseEnvelope<Void> addBalance(@PathVariable Long id, @RequestBody java.math.BigDecimal amount) {
        service.addBalance(id, amount);
        return ResponseEnvelope.success(null, "Balance added");
    }
}
