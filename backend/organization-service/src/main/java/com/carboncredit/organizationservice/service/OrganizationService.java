package com.carboncredit.organizationservice.service;

import com.carboncredit.organizationservice.model.Organization;
import com.carboncredit.organizationservice.repository.OrganizationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrganizationService {

    private final OrganizationRepository repository;

    public Organization registerOrganization(Organization org) {
        log.info("Registering new organization: {}", org.getName());
        // Add business validation here if needed
        return repository.save(org);
    }

    public Organization getOrganization(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Organization not found with id: " + id));
    }

    public List<Organization> getAllOrganizations() {
        return repository.findAll();
    }
}
