package com.carbon.gateway.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    // Ensure this secret is at least 32 characters long for HS256
    @Value("${jwt.secret:1eCXep68N0UQLUnjU3ZzA5mP/f+YfZI4KyDOg2CeWspe6kMGlMZlxdQJEct5QS6WWFmNoePJ14/isUCCQfvPoA==}")
    private String secret;

    private SecretKey getSigningKey() {
        byte[] keyBytes = this.secret.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes); // Ensure secret length is 256 bits (32 chars) minimum.
    }

    public String generateToken(Long userId, String email, String name, String role, Long organizationId) {
        long expirationTime = 1000 * 60 * 60 * 24; // 24 hours

        return Jwts.builder()
                .subject(String.valueOf(userId))
                .claim("email", email)
                .claim("name", name)
                .claim("role", role)
                .claim("organizationId", organizationId == null ? "" : String.valueOf(organizationId))
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationTime))
                .signWith(getSigningKey())
                .compact();
    }

    public Claims getAllClaimsFromToken(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean validateToken(String token) {
        try {
            getAllClaimsFromToken(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
