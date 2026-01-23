package com.carboncredit.userservice.security;

import com.carboncredit.userservice.model.User;
import com.carboncredit.userservice.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Optional;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtUtils jwtUtils;
    private final UserRepository userRepository;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");

        log.info("OAuth2 Login successful for email: {}", email);

        // Find or create user
        User user = userRepository.findByEmail(email)
                .orElseGet(() -> {
                    log.info("Creating new user for Google email: {}", email);
                    User newUser = User.builder()
                            .email(email)
                            .name(name != null ? name : email)// Use email as username initially
                            .role("USER") // Default role
                            .password("") // No password for OAuth users
                            .organizationId(null) // Needs to be set later
                            .build();
                    return userRepository.save(newUser);
                });

        // Generate JWT
        String token = jwtUtils.generateToken(user.getEmail(), user.getId(), user.getRole(), user.getOrganizationId());

        // Redirect to frontend with token
        // In a real app, you might use a cookie or a specific redirect URL
        // For now, we'll redirect to a simple success page with the token as query
        // param
        String targetUrl = "http://localhost:3000/oauth2/redirect?token=" + token;

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
