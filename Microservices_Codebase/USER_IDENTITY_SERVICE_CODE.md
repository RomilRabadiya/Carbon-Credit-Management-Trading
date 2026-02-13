### File: user-identity-service/Dockerfile
```user-identity-service/Dockerfile
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean install -pl common-library -am -DskipTests
RUN mvn clean package -pl user-identity-service -am -DskipTests

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=build /app/user-identity-service/target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### File: user-identity-service/pom.xml
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <parent>
        <artifactId>backend</artifactId>
        <groupId>com.carboncredit</groupId>
        <version>0.0.1-SNAPSHOT</version>
    </parent>
    <modelVersion>4.0.0</modelVersion>

    <artifactId>user-identity-service</artifactId>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-openfeign</artifactId>
        </dependency>

        <dependency>
            <groupId>com.carboncredit</groupId>
            <artifactId>common-library</artifactId>
            <version>0.0.1-SNAPSHOT</version>
        </dependency>
        <dependency>
            <groupId>org.springframework.kafka</groupId>
            <artifactId>spring-kafka</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>org.postgresql</groupId>
            <artifactId>postgresql</artifactId>
            <scope>runtime</scope>
        </dependency>
        
        <!-- Security & OAuth2 -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-oauth2-resource-server</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.security</groupId>
            <artifactId>spring-security-oauth2-jose</artifactId>
        </dependency>

        <!-- JWT Support -->
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
        <!-- Adding Data JPA/Postgres later as needed -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>


    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <configuration>
                    <annotationProcessorPaths>
                        <path>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                            <version>1.18.30</version>
                        </path>
                    </annotationProcessorPaths>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
```

### File: user-identity-service/src/main/resources/application.properties
```properties
server.port=8082
spring.application.name=user-identity-service
eureka.client.serviceUrl.defaultZone=http://localhost:8761/eureka/

# NeonDB Database Configuration
spring.datasource.url=jdbc:postgresql://ep-cold-fog-a13rf1hh-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channelBinding=require
spring.datasource.username=neondb_owner
spring.datasource.password=npg_zie8fp2IGWkO
spring.datasource.driverClassName=org.postgresql.Driver
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.properties.hibernate.default_schema=user_identity
spring.jpa.hibernate.ddl-auto=update
spring.datasource.hikari.data-source-properties.ssl=true
spring.datasource.hikari.data-source-properties.sslmode=require



# Resource Server Configuration
spring.security.oauth2.resourceserver.jwt.issuer-uri=https://accounts.google.com
spring.security.oauth2.resourceserver.jwt.jwk-set-uri=https://www.googleapis.com/oauth2/v3/certs

# Eureka Configuration
eureka.instance.hostname=localhost

logging.level.org.springframework.security=DEBUG
spring.sql.init.mode=always
spring.jpa.properties.hibernate.hbm2ddl.create_namespaces=true
```

### File: user-identity-service/src/main/java/com/carboncredit/userservice/dto/AuthResponse.java
```java
package com.carboncredit.userservice.dto;

import com.carboncredit.userservice.model.User;

public class AuthResponse {
    private String token;
    private User user;

    public AuthResponse() {
    }

    public AuthResponse(String token, User user) {
        this.token = token;
        this.user = user;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }
}
```

### File: user-identity-service/src/main/java/com/carboncredit/userservice/dto/AuthRequest.java
```java
package com.carboncredit.userservice.dto;

public class AuthRequest {
    private String email;
    private String password;

    public AuthRequest() {
    }

    public AuthRequest(String email, String password) {
        this.email = email;
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
```

### File: user-identity-service/src/main/java/com/carboncredit/userservice/repository/UserRepository.java
```java
package com.carboncredit.userservice.repository;

import com.carboncredit.userservice.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
}
```

### File: user-identity-service/src/main/java/com/carboncredit/userservice/config/SecurityConfig.java
```java
package com.carboncredit.userservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                http
                                .csrf(AbstractHttpConfigurer::disable)
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                .authorizeHttpRequests(auth -> auth
                                                .anyRequest().authenticated())
                                .oauth2ResourceServer(oauth2 -> oauth2
                                                .jwt(org.springframework.security.config.Customizer.withDefaults()));

                return http.build();
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration config = new CorsConfiguration();
                config.setAllowCredentials(true);
                config.setAllowedOrigins(Arrays.asList("http://localhost:5173", "http://localhost:8080"));
                config.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                config.setAllowedHeaders(Arrays.asList("*"));

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", config);
                return source;
        }
}
```

### File: user-identity-service/src/main/java/com/carboncredit/userservice/UserServiceApplication.java
```java
package com.carboncredit.userservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableDiscoveryClient
@EnableFeignClients
public class UserServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(UserServiceApplication.class, args);
    }
}
```

### File: user-identity-service/src/main/java/com/carboncredit/userservice/controller/UserController.java
```java
package com.carboncredit.userservice.controller;

import com.carboncredit.common.dto.ResponseEnvelope;
import com.carboncredit.userservice.model.User;
import com.carboncredit.userservice.service.UserService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService service;

    public UserController(UserService service) {
        this.service = service;
    }

    @PostMapping
    public ResponseEnvelope<User> registerUser(@RequestBody User user) {
        return ResponseEnvelope.success(service.registerUser(user), "User registered successfully");
    }

    @PostMapping("/complete-profile")
    public ResponseEnvelope<User> completeProfile(@RequestBody java.util.Map<String, Object> payload,
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.oauth2.jwt.Jwt jwt) {
        String email = jwt.getClaimAsString("email");
        String role = (String) payload.get("role");

        @SuppressWarnings("unchecked")
        java.util.Map<String, Object> additionalData = (java.util.Map<String, Object>) payload.get("additionalData");

        return ResponseEnvelope.success(service.completeProfile(email, role, additionalData),
                "Profile completed successfully");
    }

    @GetMapping("/current")
    public ResponseEnvelope<User> getCurrentUser(
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.oauth2.jwt.Jwt jwt) {
        String email = jwt.getClaimAsString("email");
        String name = jwt.getClaimAsString("name");
        String picture = jwt.getClaimAsString("picture");

        return ResponseEnvelope.success(service.getOrCreateUser(email, name, picture), "Current user retrieved");
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
```

### File: user-identity-service/src/main/java/com/carboncredit/userservice/model/User.java
```java
package com.carboncredit.userservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    private String name;

    private String picture;

    private String password;

    // RBAC Fields
    private String role; // USER, ORGANIZATION, VERIFIER

    @Builder.Default
    @com.fasterxml.jackson.annotation.JsonProperty("isProfileComplete")
    private boolean isProfileComplete = false;

    private Long organizationId;
}
```

### File: user-identity-service/src/main/java/com/carboncredit/userservice/service/UserService.java
```java
package com.carboncredit.userservice.service;

import com.carboncredit.userservice.client.OrganizationClient;
import com.carboncredit.userservice.model.User;
import com.carboncredit.userservice.repository.UserRepository;
import com.carboncredit.common.dto.ResponseEnvelope; // Verify this import exists or use Object
// Assuming common-library is available as per pom.xml

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);
    private final UserRepository repository;
    private final OrganizationClient organizationClient;

    public UserService(UserRepository repository, OrganizationClient organizationClient) {
        this.repository = repository;
        this.organizationClient = organizationClient;
    }

    public User registerUser(User user) {
        log.info("Registering user: {}", user.getEmail());
        if (repository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("User already exists with email: " + user.getEmail());
        }
        return repository.save(user);
    }

    @Transactional
    public User completeProfile(String email, String role, Map<String, Object> additionalData) {
        User user = repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found: " + email));

        user.setRole(role);
        user.setProfileComplete(true);

        if ("ORGANIZATION".equalsIgnoreCase(role)) {
            // Create Organization in Org Service
            try {
                // Prepare Org Data from additionalData
                // Assuming additionalData has "name", "address", etc.
                // We pass it to Org Service via Feign
                log.info("Creating organization for user: {}", email);
                ResponseEnvelope<Object> response = organizationClient.registerOrganization(additionalData);

                // Assuming response data has ID, we might want to store it in User
                // But for now, we just ensure it's created.
                // ideally, get ID and set user.setOrganizationId(...)
                if (response.getData() != null) {
                    // Extract ID
                    try {
                        // Response data is likely a Map if not using shared DTO
                        java.util.Map<String, Object> orgData = (java.util.Map<String, Object>) response.getData();
                        Object idObj = orgData.get("id");
                        if (idObj instanceof Number) {
                            user.setOrganizationId(((Number) idObj).longValue());
                            log.info("Organization created successfully with ID: {}", user.getOrganizationId());
                        } else {
                            log.warn("Organization created but ID not found or invalid type in response");
                        }
                    } catch (Exception e) {
                        log.error("Failed to extract organization ID from response", e);
                        // We don't block profile completion if ID extraction fails, but it's risky for
                        // future logic
                    }
                }

            } catch (Exception e) {
                log.error("Failed to create organization: ", e);
                // Decide: rollback? Or just log?
                // Rolling back profile completion if org creation fails seems right
                throw new RuntimeException("Failed to create organization", e);
            }
        }

        return repository.save(user);
    }

    @SuppressWarnings("null")
    public User getUser(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    public User getUserByEmail(String email) {
        return repository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }

    @Transactional
    public User getOrCreateUser(String email, String name, String picture) {
        return repository.findByEmail(email)
                .orElseGet(() -> {
                    log.info("Creating new user from OAuth2 login: {}", email);
                    User newUser = User.builder()
                            .email(email)
                            .name(name)
                            .picture(picture)
                            .role("USER")
                            .isProfileComplete(false)
                            .build();
                    return repository.save(newUser);
                });
    }

    public List<User> getAllUsers() {
        return repository.findAll();
    }
}
```

### File: user-identity-service/src/main/java/com/carboncredit/userservice/client/OrganizationClient.java
```java
package com.carboncredit.userservice.client;

import com.carboncredit.common.dto.ResponseEnvelope;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

// Define DTOs here or import them if available
// For simplicity, using Object or Map if Organization class isn't available in this service
// Ideally, use a shared library for DTOs.
// I will use a simple inner record or class for OrganizationDTO if Common Library doesn't have it.
// Actually, I should use the common-library if it has OrganizationDTO.
// But earlier list_dir of common-library showed Event classes.
// I'll stick to a generic Object or a local DTO for now to avoid dependency hell.

@FeignClient(name = "organization-service")
public interface OrganizationClient {

    @PostMapping("/api/organizations")
    ResponseEnvelope<Object> registerOrganization(@RequestBody Object organization);
}
```

