package com.carboncredit.userservice.controller;

import com.carboncredit.common.dto.ResponseEnvelope;
import com.carboncredit.userservice.model.User;
import com.carboncredit.userservice.service.UserService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService service;

    public UserController(UserService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEnvelope<User> registerUser(@RequestBody User user) {
        return ResponseEnvelope.success(service.registerUser(user), "User registered successfully");
    }

    @PostMapping("/complete-profile")
    public ResponseEnvelope<User> completeProfile(@RequestBody java.util.Map<String, Object> payload,
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.oauth2.jwt.Jwt jwt) {
        String email = jwt.getClaimAsString("email");
        String role = (String) payload.get("role");

        @SuppressWarnings("unchecked")
        java.util.Map<String, Object> additionalData = (java.util.Map<String, Object>) payload.get("additionalData");

        return ResponseEnvelope.success(service.completeProfile(email, role, additionalData),
                "Profile completed successfully");
    }

    @GetMapping("/current")
    public ResponseEnvelope<User> getCurrentUser(
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.oauth2.jwt.Jwt jwt) {
        String email = jwt.getClaimAsString("email");

        // Extract from user_metadata if available (Supabase standard)
        String name = jwt.getClaimAsString("name");
        String picture = jwt.getClaimAsString("picture");

        java.util.Map<String, Object> userMetadata = jwt.getClaim("user_metadata");
        if (userMetadata != null) {
            if (name == null) {
                name = (String) userMetadata.get("full_name"); // Common Supabase/Google mapping
                if (name == null)
                    name = (String) userMetadata.get("name");
            }
            if (picture == null) {
                picture = (String) userMetadata.get("avatar_url"); // Common Supabase/Google mapping
                if (picture == null)
                    picture = (String) userMetadata.get("picture");
            }
        }

        // Fallback if still null
        if (name == null)
            name = "User";

        return ResponseEnvelope.success(service.getOrCreateUser(email, name, picture), "Current user retrieved");
    }

    @GetMapping("/{id}")
    public ResponseEnvelope<User> getUser(@PathVariable Long id) {
        return ResponseEnvelope.success(service.getUser(id), "User found");
    }

    @GetMapping
    public ResponseEnvelope<List<User>> getAll() {
        return ResponseEnvelope.success(service.getAllUsers(), "Users retrieved");
    }
}
