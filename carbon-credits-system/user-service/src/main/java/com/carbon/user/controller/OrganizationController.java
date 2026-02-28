package com.carbon.user.controller;

import java.math.BigDecimal;

import org.springframework.http.ResponseEntity;

import com.carbon.user.model.Organization;
import com.carbon.user.service.OrganizationService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/organizations")
@RequiredArgsConstructor
public class OrganizationController {
    private final OrganizationService service;

    // Register organization
    @PostMapping
    public ResponseEntity<Organization> registerOrganization(
            @RequestBody Organization org) {

        Organization savedOrg = service.registerOrganization(org);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(savedOrg);
    }

    // Get organization by ID
    @GetMapping("/{id}")
    public ResponseEntity<Organization> getOrganization(
            @PathVariable Long id) {

        return ResponseEntity.ok(service.getOrganization(id));
    }

    // Get all organizations
    @GetMapping
    public ResponseEntity<List<Organization>> getAll() {
        return ResponseEntity.ok(service.getAllOrganizations());
    }

    // Deduct balance
    @PostMapping("/{id}/balance/deduct")
    public ResponseEntity<Void> deductBalance(
            @PathVariable Long id,
            @RequestBody BigDecimal amount) {

        service.deductBalance(id, amount);
        return ResponseEntity.ok().build();
    }

    // Add balance
    @PostMapping("/{id}/balance/add")
    public ResponseEntity<Void> addBalance(
            @PathVariable Long id,
            @RequestBody BigDecimal amount) {

        service.addBalance(id, amount);
        return ResponseEntity.ok().build();
    }
}
