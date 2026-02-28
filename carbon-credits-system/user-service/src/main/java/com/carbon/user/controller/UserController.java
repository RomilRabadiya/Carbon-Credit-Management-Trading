package com.carbon.user.controller;

import com.carbon.user.dto.*;
import com.carbon.user.model.*;
import com.carbon.user.service.*;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService service;

    public UserController(UserService service) {
        this.service = service;
    }

    // Register new user
    @PostMapping
    public ResponseEntity<User> registerUser(@RequestBody RegisterUserRequest request) {

        User user = User.builder()
                .email(request.getEmail())
                .name(request.getName())
                .picture(request.getPicture())
                .password(request.getPassword())
                .role("USER")
                .isProfileComplete(false)
                .build();

        User createdUser = service.registerUser(user);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(createdUser);
    }

    // Complete profile
    @PostMapping("/complete-profile")
    public ResponseEntity<User> completeProfile(
            @RequestHeader("X-User-Email") String email,
            @RequestBody CompleteProfileRequest request) {

        User updatedUser = service.completeProfile(
                email,
                request.getRole(),
                request.getOrganization());

        return ResponseEntity.ok(updatedUser);
    }

    // Get current authenticated user
    @GetMapping("/current")
    public ResponseEntity<User> getCurrentUser(
            @RequestHeader("X-User-Email") String email) {

        User user = service.getUserByEmail(email);

        return ResponseEntity.ok(user);
    }

    // Get by ID
    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {

        return ResponseEntity.ok(service.getUser(id));
    }

    // Get all users
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {

        return ResponseEntity.ok(service.getAllUsers());
    }
}
