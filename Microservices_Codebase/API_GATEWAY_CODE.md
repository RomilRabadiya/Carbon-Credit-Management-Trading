### File: api-gateway/Dockerfile
```api-gateway/Dockerfile
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean install -pl common-library -am -DskipTests
RUN mvn clean package -pl api-gateway -am -DskipTests

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=build /app/api-gateway/target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### File: api-gateway/pom.xml
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <parent>
        <artifactId>backend</artifactId>
        <groupId>com.carboncredit</groupId>
        <version>0.0.1-SNAPSHOT</version>
    </parent>
    <modelVersion>4.0.0</modelVersion>

    <artifactId>api-gateway</artifactId>

    <dependencies>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-gateway</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
             <exclusions>
                <exclusion>
                    <groupId>org.springframework.boot</groupId>
                    <artifactId>spring-boot-starter-web</artifactId>
                </exclusion>
                <exclusion>
                    <groupId>org.springframework.boot</groupId>
                    <artifactId>spring-boot-starter-webmvc</artifactId>
                </exclusion>
            </exclusions>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-loadbalancer</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-oauth2-client</artifactId>
        </dependency>
        <!-- JWT Support for Validation -->
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>0.11.5</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>0.11.5</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>0.11.5</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
</project>
```

### File: api-gateway/application-local.yml
```yml
server:
  port: 8080

spring:
  application:
    name: api-gateway
  
  cloud:
    gateway:
      discovery:
        locator:
          enabled: true
          lower-case-service-id: true
      routes:
        - id: oauth2-login
          uri: lb://user-identity-service
          predicates:
            - Path=/login/**, /oauth2/**
        
        - id: user-identity-service
          uri: lb://user-identity-service
          predicates:
            - Path=/api/users/**

        - id: auth-service
          uri: lb://user-identity-service
          predicates:
            - Path=/api/auth/**

        - id: organization-service
          uri: lb://organization-service
          predicates:
            - Path=/api/organizations/**

        - id: emission-reporting-service
          uri: lb://emission-reporting-service
          predicates:
            - Path=/api/emissions/**

        - id: verification-service
          uri: lb://verification-service
          predicates:
            - Path=/api/verifications/**

        - id: credit-issuance-service
          uri: lb://credit-issuance-service
          predicates:
            - Path=/api/credits/**

        - id: trading-service
          uri: lb://trading-service
          predicates:
            - Path=/api/trading/**, /api/transactions/**

        - id: audit-ledger-service
          uri: lb://audit-ledger-service
          predicates:
            - Path=/api/audit/**

eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
    register-with-eureka: true
    fetch-registry: true
```

### File: api-gateway/src/main/resources/application.yml
```yml
server:
  port: 8080

spring:
  application:
    name: api-gateway
  
  security:
    oauth2:
      client:
        registration:
          google:
            client-id: 708607407785-pokfj5e5kpnl3b91lodkv6rq4jmq119i.apps.googleusercontent.com
            client-secret: ${GOOGLE_CLIENT_SECRET}
            scope: openid, profile, email
            redirect-uri: "{baseUrl}/login/oauth2/code/google"
        provider:
          google:
            issuer-uri: https://accounts.google.com

  cloud:
    gateway:
      default-filters:
        - AddIdTokenHeader
      discovery:
        locator:
          enabled: true
          lower-case-service-id: true
      routes:
        - id: oauth2-login
          uri: lb://user-identity-service
          predicates:
            - Path=/login/**, /oauth2/**
        
        - id: auth-service
          uri: lb://user-identity-service
          predicates:
            - Path=/api/auth/**
        
        - id: user-identity-service
          uri: lb://user-identity-service
          predicates:
            - Path=/api/users/**

        - id: organization-service
          uri: lb://organization-service
          predicates:
            - Path=/api/organizations/**

        - id: emission-reporting-service
          uri: lb://emission-reporting-service
          predicates:
            - Path=/api/emissions/**

        - id: verification-service
          uri: lb://verification-service
          predicates:
            - Path=/api/verifications/**

        - id: credit-issuance-service
          uri: lb://credit-issuance-service
          predicates:
            - Path=/api/credits/**

        - id: trading-service
          uri: lb://trading-service
          predicates:
            - Path=/api/trading/**, /api/transactions/**

        - id: audit-ledger-service
          uri: lb://audit-ledger-service
          predicates:
            - Path=/api/audit/**


        - id: geo-service
          uri: http://localhost:8001
          predicates:
            - Path=/api/geo/**
          filters:
            - RewritePath=/api/geo/(?<segment>.*), /$\{segment}

      globalcors:
        cors-configurations:
          '[/**]':
            allowedOrigins: "http://localhost:5173"
            allowedMethods:
              - GET
              - POST
              - PUT
              - DELETE
              - OPTIONS
            allowedHeaders: "*"
            allowCredentials: true

eureka:
  instance:
    hostname: localhost
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
    register-with-eureka: true
    fetch-registry: true
```

### File: api-gateway/src/main/java/com/carboncredit/apigateway/config/SessionConfig.java
```java
package com.carboncredit.apigateway.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.server.session.CookieWebSessionIdResolver;
import org.springframework.web.server.session.WebSessionIdResolver;

@Configuration
public class SessionConfig {

    @Bean
    public WebSessionIdResolver webSessionIdResolver() {
        CookieWebSessionIdResolver resolver = new CookieWebSessionIdResolver();
        resolver.setCookieName("SESSION");
        resolver.addCookieInitializer((builder) -> builder.path("/")
                .httpOnly(true)
                .secure(false) // Allow non-HTTPS for localhost
                .sameSite("Lax")); // Allow SameSite for localhost
        return resolver;
    }
}
```

### File: api-gateway/src/main/java/com/carboncredit/apigateway/security/SecurityConfig.java
```java
package com.carboncredit.apigateway.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.web.server.SecurityWebFilterChain;

@Configuration
@EnableWebFluxSecurity
public class SecurityConfig {

    @Bean
    public SecurityWebFilterChain springSecurityFilterChain(ServerHttpSecurity http) {
        http
                .csrf(ServerHttpSecurity.CsrfSpec::disable)
                .authorizeExchange(exchange -> exchange
                        .pathMatchers("/eureka/**").permitAll()
                        .anyExchange().authenticated())
                .oauth2Login(oauth2 -> oauth2
                        .authenticationSuccessHandler(
                                new org.springframework.security.web.server.authentication.RedirectServerAuthenticationSuccessHandler(
                                        "http://localhost:5173")))
                .exceptionHandling(exceptionHandling -> exceptionHandling
                        .authenticationEntryPoint(
                                new org.springframework.security.web.server.authentication.HttpStatusServerEntryPoint(
                                        org.springframework.http.HttpStatus.UNAUTHORIZED)));
        return http.build();
    }
}
```

### File: api-gateway/src/main/java/com/carboncredit/apigateway/ApiGatewayApplication.java
```java
package com.carboncredit.apigateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class ApiGatewayApplication {
    public static void main(String[] args) {
        SpringApplication.run(ApiGatewayApplication.class, args);
    }
}
```

### File: api-gateway/src/main/java/com/carboncredit/apigateway/filter/AddIdTokenHeaderGatewayFilterFactory.java
```java
package com.carboncredit.apigateway.filter;

import org.springframework.cloud.gateway.filter.GatewayFilter;
import org.springframework.cloud.gateway.filter.factory.AbstractGatewayFilterFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.security.oauth2.client.OAuth2AuthorizedClient;
import org.springframework.security.oauth2.client.ReactiveOAuth2AuthorizedClientService;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import reactor.core.publisher.Mono;

@Component
public class AddIdTokenHeaderGatewayFilterFactory extends AbstractGatewayFilterFactory<Object> {

    public AddIdTokenHeaderGatewayFilterFactory() {
        super(Object.class);
    }

    @Override
    public GatewayFilter apply(Object config) {
        return (exchange, chain) -> exchange.getPrincipal()
                .filter(principal -> principal instanceof OAuth2AuthenticationToken)
                .cast(OAuth2AuthenticationToken.class)
                .map(OAuth2AuthenticationToken::getPrincipal)
                .filter(principal -> principal instanceof OidcUser)
                .cast(OidcUser.class)
                .map(OidcUser::getIdToken)
                .map(idToken -> {
                    // Log for debugging
                    // System.out.println("Relaying ID Token: " +
                    // idToken.getTokenValue().substring(0, 10) + "...");
                    exchange.getRequest().mutate()
                            .header(HttpHeaders.AUTHORIZATION, "Bearer " + idToken.getTokenValue())
                            .build();
                    return exchange;
                })
                .flatMap(e -> chain.filter(exchange))
                .switchIfEmpty(chain.filter(exchange));
    }
}
```

### File: api-gateway/src/main/java/com/carboncredit/apigateway/filter/AuthenticationGatewayFilterFactory.java
```java
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
```

