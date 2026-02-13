package com.carboncredit.apigateway.filter;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.security.Key;

@Component
public class AuthenticationGatewayFilterFactory
        extends AbstractGatewayFilterFactory<AuthenticationGatewayFilterFactory.Config> {

    @Value("${jwt.secret:404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970}")
    private String secretKey;

    public AuthenticationGatewayFilterFactory() {
        super(Config.class);
    }

    @Override
    public GatewayFilter apply(Config config) {
        return (exchange, chain) -> {
            // RELAXED FILTER: Relying on Spring Security & TokenRelay
            // if (validator.isSecured.test(exchange.getRequest())) {
            // // Check for generic Authorization header
            // if
            // (!exchange.getRequest().getHeaders().containsKey(HttpHeaders.AUTHORIZATION))
            // {
            // throw new RuntimeException("Missing Authorization Header");
            // }

            // String authHeader =
            // exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            // if (authHeader != null && authHeader.startsWith("Bearer ")) {
            // authHeader = authHeader.substring(7);
            // }

            // try {
            // // validateToken(authHeader);
            // } catch (Exception e) {
            // exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            // return exchange.getResponse().setComplete();
            // }
            // }
            return chain.filter(exchange);
        };
    }

    private void validateToken(String token) {
        Jwts.parserBuilder().setSigningKey(getSignKey()).build().parseClaimsJws(token);
    }

    private Key getSignKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public static class Config {
        // Put configuration properties here
    }

    private final RouteValidator validator = new RouteValidator();

    public static class RouteValidator {
        public java.util.function.Predicate<org.springframework.http.server.reactive.ServerHttpRequest> isSecured = request -> java.util.List
                .of(
                        "/api/auth/register",
                        "/api/auth/login",
                        "/eureka")
                .stream()
                .noneMatch(uri -> request.getURI().getPath().contains(uri));
    }
}
