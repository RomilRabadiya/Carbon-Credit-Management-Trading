package com.carboncredit.userservice.controller;

import com.carboncredit.common.dto.ResponseEnvelope;
import com.carboncredit.userservice.model.User;
import com.carboncredit.userservice.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService service;

    @PostMapping
    public ResponseEnvelope<User> registerUser(@RequestBody User user) {
        return ResponseEnvelope.success(service.registerUser(user), "User registered successfully");
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
