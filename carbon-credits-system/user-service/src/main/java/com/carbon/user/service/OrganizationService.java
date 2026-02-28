package com.carbon.user.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.carbon.user.model.Organization;
import com.carbon.user.repository.*;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class OrganizationService {
    private final OrganizationRepository repository;

    public Organization registerOrganization(Organization org) {

        if (repository.existsByName(org.getName())) {
            throw new IllegalArgumentException(
                    "Organization with name '" + org.getName() + "' already exists.");
        }

        if (repository.existsByContactEmail(org.getContactEmail())) {
            throw new IllegalArgumentException(
                    "Organization with email '" + org.getContactEmail() + "' already exists.");
        }

        if (org.getBalance() == null) {
            org.setBalance(BigDecimal.ZERO);
        }

        log.info("Organization registered: {}", org.getName());

        return repository.save(org);
    }

    public void deductBalance(Long id, BigDecimal amount) {

        Organization org = getOrganization(id);

        if (org.getBalance().compareTo(amount) < 0) {
            throw new IllegalArgumentException("Insufficient funds");
        }

        org.setBalance(org.getBalance().subtract(amount));
    }

    public void addBalance(Long id, BigDecimal amount) {

        Organization org = getOrganization(id);
        org.setBalance(org.getBalance().add(amount));
    }

    public Organization getOrganization(Long id) {

        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Organization not found with id: " + id));
    }

    public List<Organization> getAllOrganizations() {
        return repository.findAll();
    }
}
