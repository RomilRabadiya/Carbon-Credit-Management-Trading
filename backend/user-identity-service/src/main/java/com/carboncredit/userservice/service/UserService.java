package com.carboncredit.userservice.service;

import com.carboncredit.userservice.client.OrganizationClient;
import com.carboncredit.userservice.model.User;
import com.carboncredit.userservice.repository.UserRepository;
import com.carboncredit.common.dto.ResponseEnvelope; // Verify this import exists or use Object
// Assuming common-library is available as per pom.xml

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);
    private final UserRepository repository;
    private final OrganizationClient organizationClient;

    public UserService(UserRepository repository, OrganizationClient organizationClient) {
        this.repository = repository;
        this.organizationClient = organizationClient;
    }

    public User registerUser(User user) {
        log.info("Registering user: {}", user.getEmail());
        if (repository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("User already exists with email: " + user.getEmail());
        }
        return repository.save(user);
    }

    @Transactional
    public User completeProfile(String email, String role, Map<String, Object> additionalData) {
        User user = repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        user.setRole(role);
        user.setProfileComplete(true);

        if ("ORGANIZATION".equalsIgnoreCase(role)) {
            // Create Organization in Org Service
            try {
                // Prepare Org Data from additionalData
                // Assuming additionalData has "name", "address", etc.
                // We pass it to Org Service via Feign
                log.info("Creating organization for user: {}", email);
                ResponseEnvelope<Object> response = organizationClient.registerOrganization(additionalData);

                // Assuming response data has ID, we might want to store it in User
                // But for now, we just ensure it's created.
                // ideally, get ID and set user.setOrganizationId(...)
                if (response.getData() != null) {
                    // Extract ID
                    try {
                        // Response data is likely a Map if not using shared DTO
                        java.util.Map<String, Object> orgData = (java.util.Map<String, Object>) response.getData();
                        Object idObj = orgData.get("id");
                        if (idObj instanceof Number) {
                            user.setOrganizationId(((Number) idObj).longValue());
                            log.info("Organization created successfully with ID: {}", user.getOrganizationId());
                        } else {
                            log.warn("Organization created but ID not found or invalid type in response");
                        }
                    } catch (Exception e) {
                        log.error("Failed to extract organization ID from response", e);
                        // We don't block profile completion if ID extraction fails, but it's risky for
                        // future logic
                    }
                }

            } catch (Exception e) {
                log.error("Failed to create organization: ", e);
                // Decide: rollback? Or just log?
                // Rolling back profile completion if org creation fails seems right
                throw new RuntimeException("Failed to create organization", e);
            }
        }

        return repository.save(user);
    }

    @SuppressWarnings("null")
    public User getUser(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    public User getUserByEmail(String email) {
        return repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }

    @Transactional
    public User getOrCreateUser(String email, String name, String picture) {
        return repository.findByEmail(email)
                .orElseGet(() -> {
                    log.info("Creating new user from OAuth2 login: {}", email);
                    User newUser = User.builder()
                            .email(email)
                            .name(name)
                            .picture(picture)
                            .role("USER")
                            .isProfileComplete(false)
                            .build();
                    return repository.save(newUser);
                });
    }

    public List<User> getAllUsers() {
        return repository.findAll();
    }
}
