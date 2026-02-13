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

        if (repository.existsByName(org.getName())) {
            throw new IllegalArgumentException("Organization with name '" + org.getName() + "' already exists.");
        }
        if (repository.existsByContactEmail(org.getContactEmail())) {
            throw new IllegalArgumentException(
                    "Organization with email '" + org.getContactEmail() + "' already exists.");
        }

        if (org.getBalance() == null) {
            org.setBalance(java.math.BigDecimal.ZERO);
        }
        return repository.save(org);
    }

    public void deductBalance(Long id, java.math.BigDecimal amount) {
        Organization org = getOrganization(id);
        if (org.getBalance().compareTo(amount) < 0) {
            throw new IllegalStateException("Insufficient funds");
        }
        org.setBalance(org.getBalance().subtract(amount));
        repository.save(org);
    }

    public void addBalance(Long id, java.math.BigDecimal amount) {
        Organization org = getOrganization(id);
        org.setBalance(org.getBalance().add(amount));
        repository.save(org);
    }

    @SuppressWarnings("null")
    public Organization getOrganization(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Organization not found with id: " + id));
    }

    public List<Organization> getAllOrganizations() {
        return repository.findAll();
    }
}
