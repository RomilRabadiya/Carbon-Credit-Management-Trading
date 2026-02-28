package com.carbon.gateway.controller;

import com.carbon.gateway.dto.AuthRequest;
import com.carbon.gateway.dto.AuthResponse;
import com.carbon.gateway.util.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final JdbcTemplate jdbcTemplate;
    private final JwtUtil jwtUtil;
    private final PasswordEncoder passwordEncoder;

    public AuthController(JdbcTemplate jdbcTemplate, JwtUtil jwtUtil, PasswordEncoder passwordEncoder) {
        this.jdbcTemplate = jdbcTemplate;
        this.jwtUtil = jwtUtil;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/login")
    public Mono<ResponseEntity<AuthResponse>> login(@RequestBody AuthRequest request) {
        return Mono.fromCallable(() -> {
            String sql = "SELECT id, email, password, name, role, organization_id FROM users WHERE email = ?";

            try {
                Map<String, Object> user = jdbcTemplate.queryForMap(sql, request.getEmail());

                String storedPassword = (String) user.get("password");

                // Compare hashed password with provided password
                if (passwordEncoder.matches(request.getPassword(), storedPassword)) {

                    Long id = ((Number) user.get("id")).longValue();
                    String email = (String) user.get("email");
                    String name = (String) user.get("name");
                    String role = (String) user.get("role");
                    Number orgIdNum = (Number) user.get("organization_id");
                    Long orgId = orgIdNum != null ? orgIdNum.longValue() : null;

                    String token = jwtUtil.generateToken(id, email, name, role, orgId);

                    return ResponseEntity.ok(new AuthResponse(token, id, email, name, role, orgId));
                } else {
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).<AuthResponse>build();
                }
            } catch (Exception e) {
                // User not found or other DB error
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).<AuthResponse>build();
            }
        }).subscribeOn(Schedulers.boundedElastic());
    }
}
