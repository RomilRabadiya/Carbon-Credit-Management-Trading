package com.carboncredit.tradingservice.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationConverter;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/actuator/**").permitAll()
                        .anyRequest().authenticated())
                .oauth2ResourceServer(
                        oauth2 -> oauth2.jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter())));

        return http.build();
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(jwt -> {
            Map<String, Object> claims = jwt.getClaims();

            // Check app_metadata
            if (claims.containsKey("app_metadata")) {
                Map<String, Object> appMetadata = (Map<String, Object>) claims.get("app_metadata");
                if (appMetadata.containsKey("roles")) {
                    Object rolesObj = appMetadata.get("roles");
                    if (rolesObj instanceof List<?>) {
                        return ((List<?>) rolesObj).stream()
                                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.toString().toUpperCase()))
                                .collect(Collectors.toList());
                    }
                }
                // Handle provider specific role if needed (e.g. "provider": "google")
            }

            // Check user_metadata as fallback
            if (claims.containsKey("user_metadata")) {
                Map<String, Object> userMetadata = (Map<String, Object>) claims.get("user_metadata");
                if (userMetadata.containsKey("role")) {
                    return List.of(
                            new SimpleGrantedAuthority("ROLE_" + userMetadata.get("role").toString().toUpperCase()));
                }
            }

            return Collections.emptyList();
        });
        return converter;
    }
}
