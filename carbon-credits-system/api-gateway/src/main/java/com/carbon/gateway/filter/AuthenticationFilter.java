package com.carbon.gateway.filter;

import com.carbon.gateway.util.JwtUtil;
import io.jsonwebtoken.Claims;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class AuthenticationFilter implements GlobalFilter, Ordered {

    private final JwtUtil jwtUtil;

    public AuthenticationFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        ServerHttpRequest request = exchange.getRequest();

        // 1. Skip auth for login and registration
        String path = request.getPath().value();
        if (path.startsWith("/auth/") || (path.equals("/api/users") && request.getMethod().matches("POST"))) {
            return chain.filter(exchange);
        }

        // 2. Check for Authorization header
        if (!request.getHeaders().containsKey("Authorization")) {
            return this.onError(exchange, "Missing Authorization Header", HttpStatus.UNAUTHORIZED);
        }

        String authHeader = request.getHeaders().get("Authorization").get(0);
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return this.onError(exchange, "Invalid Authorization Header", HttpStatus.UNAUTHORIZED);
        }

        String token = authHeader.substring(7);

        // 3. Validate Token
        if (!jwtUtil.validateToken(token)) {
            return this.onError(exchange, "Invalid/Expired Token", HttpStatus.UNAUTHORIZED);
        }

        // 4. Extract Claims
        Claims claims = jwtUtil.getAllClaimsFromToken(token);
        String userId = claims.getSubject();
        String role = claims.get("role", String.class);
        String organizationId = claims.get("organizationId", String.class);

        // 5. Remove any incoming X-* headers to prevent spoofing
        // 6. Inject trusted headers
        ServerHttpRequest mutatedRequest = exchange.getRequest().mutate()
                .headers(httpHeaders -> {
                    httpHeaders.remove("X-User-Id");
                    httpHeaders.remove("X-Organization-Id");
                    httpHeaders.remove("X-Role");
                })
                .header("X-User-Id", userId)
                .header("X-User-Email", claims.get("email", String.class))
                .header("X-Organization-Id", organizationId != null && !organizationId.isEmpty() ? organizationId : "")
                .header("X-Role", role != null ? role : "")
                .build();

        return chain.filter(exchange.mutate().request(mutatedRequest).build());
    }

    private Mono<Void> onError(ServerWebExchange exchange, String err, HttpStatus httpStatus) {
        exchange.getResponse().setStatusCode(httpStatus);
        return exchange.getResponse().setComplete();
    }

    @Override
    public int getOrder() {
        return -1; // Execute before routing
    }
}
