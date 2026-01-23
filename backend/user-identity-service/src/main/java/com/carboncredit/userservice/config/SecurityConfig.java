package com.carboncredit.userservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import lombok.RequiredArgsConstructor;
import com.carboncredit.userservice.security.JwtAuthenticationFilter;
import com.carboncredit.userservice.security.OAuth2LoginSuccessHandler;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {

        private final OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;
        private final JwtAuthenticationFilter jwtAuthFilter;

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http,
                        org.springframework.security.authentication.AuthenticationProvider authenticationProvider)
                        throws Exception {
                http
                                .csrf(csrf -> csrf.disable())
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers("/api/auth/**", "/login/oauth2/**", "/oauth2/**")
                                                .permitAll()
                                                .anyRequest().authenticated())
                                .oauth2Login(oauth2 -> oauth2
                                                .successHandler(oAuth2LoginSuccessHandler))
                                .sessionManagement(sess -> sess.sessionCreationPolicy(
                                                org.springframework.security.config.http.SessionCreationPolicy.STATELESS))
                                .authenticationProvider(authenticationProvider)
                                .addFilterBefore(jwtAuthFilter,
                                                org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter.class);
                return http.build();
        }

        @Bean
        public org.springframework.security.authentication.AuthenticationProvider authenticationProvider(
                        org.springframework.security.core.userdetails.UserDetailsService userDetailsService,
                        PasswordEncoder passwordEncoder) {
                org.springframework.security.authentication.dao.DaoAuthenticationProvider authProvider = new org.springframework.security.authentication.dao.DaoAuthenticationProvider();
                authProvider.setUserDetailsService(userDetailsService);
                authProvider.setPasswordEncoder(passwordEncoder);
                return authProvider;
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }
}
