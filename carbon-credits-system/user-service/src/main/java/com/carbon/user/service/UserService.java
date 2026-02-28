package com.carbon.user.service;

import com.carbon.user.model.*;
import com.carbon.user.repository.*;

import com.carbon.user.dto.*;

import org.springframework.security.crypto.password.PasswordEncoder;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigDecimal;
import java.util.List;

@Service
public class UserService {
    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    private final UserRepository repository;
    private final OrganizationRepository organizationRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository repository,
            OrganizationRepository organizationRepository,
            PasswordEncoder passwordEncoder) {
        this.repository = repository;
        this.organizationRepository = organizationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Register normal user
    public User registerUser(User user) {

        if (repository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("User already exists with email: " + user.getEmail());
        }

        log.info("Registering user: {}", user.getEmail());

        // Hash the password before saving
        user.setPassword(passwordEncoder.encode(user.getPassword()));

        return repository.save(user);
    }

    // Complete profile
    @Transactional
    public User completeProfile(String email,
            String role,
            OrganizationRequest orgRequest) {

        User user = repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        user.setRole(role);
        user.setIsProfileComplete(true);

        if ("ORGANIZATION".equalsIgnoreCase(role)) {

            if (orgRequest == null) {
                throw new RuntimeException("Organization details required for ORGANIZATION role");
            }

            Organization organization = Organization.builder()
                    .name(orgRequest.getName())
                    .type(orgRequest.getType())
                    .address(orgRequest.getAddress())
                    .contactEmail(orgRequest.getContactEmail())
                    .balance(BigDecimal.ZERO)
                    .build();

            organization = organizationRepository.save(organization);

            user.setOrganizationId(organization.getId());

            log.info("Organization created with ID: {} for user: {}",
                    organization.getId(), email);
        }

        return repository.save(user);
    }

    public User getUser(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    public User getUserByEmail(String email) {
        return repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }

    // Used for OAuth login
    @Transactional
    public User getOrCreateUser(String email, String name, String picture) {

        return repository.findByEmail(email)
                .orElseGet(() -> {
                    log.info("Creating new OAuth user: {}", email);

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
