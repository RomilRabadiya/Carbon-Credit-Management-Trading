package com.carboncredit.userservice.service;

import com.carboncredit.userservice.dto.AuthRequest;
import com.carboncredit.userservice.dto.AuthResponse;
import com.carboncredit.userservice.model.User;
import com.carboncredit.userservice.repository.UserRepository;
import com.carboncredit.userservice.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    public AuthResponse register(User user) {
        // Hash the password
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);

        // Auto-login after register
        String token = jwtUtils.generateToken(user.getEmail(), user.getId(), user.getRole(), user.getOrganizationId());
        return new AuthResponse(token);
    }

    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtUtils.generateToken(user.getEmail(), user.getId(), user.getRole(), user.getOrganizationId());
        return new AuthResponse(token);
    }
}
