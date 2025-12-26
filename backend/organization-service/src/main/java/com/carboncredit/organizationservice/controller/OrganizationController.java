package com.carboncredit.organizationservice.controller;

import com.carboncredit.common.dto.ResponseEnvelope;
import com.carboncredit.organizationservice.model.Organization;
import com.carboncredit.organizationservice.service.OrganizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orgs")
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
}
