### File: verification-service/Dockerfile
```verification-service/Dockerfile
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean install -pl common-library -am -DskipTests
RUN mvn clean package -pl verification-service -am -DskipTests

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=build /app/verification-service/target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### File: verification-service/pom.xml
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

    <artifactId>verification-service</artifactId>

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
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-openfeign</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
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
    </dependencies>

    <build>
        <plugins>
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

### File: verification-service/src/main/resources/application.properties
```properties
server.port=8084
spring.application.name=verification-service
eureka.client.serviceUrl.defaultZone=http://localhost:8761/eureka/

# H2 Database Configuration
# NeonDB Database Configuration
spring.datasource.url=jdbc:postgresql://ep-cold-fog-a13rf1hh-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channelBinding=require
spring.datasource.username=neondb_owner
spring.datasource.password=npg_zie8fp2IGWkO
spring.datasource.driverClassName=org.postgresql.Driver
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.properties.hibernate.default_schema=verification
spring.jpa.hibernate.ddl-auto=update
spring.datasource.hikari.data-source-properties.ssl=true
spring.datasource.hikari.data-source-properties.sslmode=require

# Resource Server Configuration
spring.security.oauth2.resourceserver.jwt.issuer-uri=https://accounts.google.com
spring.security.oauth2.resourceserver.jwt.jwk-set-uri=https://www.googleapis.com/oauth2/v3/certs

# Kafka Configuration
spring.kafka.bootstrap-servers=localhost:9092

# Kafka Consumer
spring.kafka.consumer.group-id=verification-group
spring.kafka.consumer.auto-offset-reset=earliest
spring.kafka.consumer.key-deserializer=org.apache.kafka.common.serialization.StringDeserializer
spring.kafka.consumer.value-deserializer=org.springframework.kafka.support.serializer.JsonDeserializer
spring.kafka.consumer.properties.spring.json.trusted.packages=com.carboncredit.common.event

# Kafka Producer
spring.kafka.producer.key-serializer=org.apache.kafka.common.serialization.StringSerializer
spring.kafka.producer.value-serializer=org.springframework.kafka.support.serializer.JsonSerializer

# JWT Configuration
jwt.secret=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
jwt.expiration=86400000
```

### File: verification-service/src/main/java/com/carboncredit/verificationservice/dto/EmissionReportDTO.java
```java
package com.carboncredit.verificationservice.dto;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class EmissionReportDTO {
    private Long id;
    private Long projectId;
    private Long organizationId;
    private String projectType;
    private BigDecimal calculatedEmission;
    private String evidenceUrl;
    private String status;
    private Double latitude;
    private Double longitude;
}
```

### File: verification-service/src/main/java/com/carboncredit/verificationservice/dto/GeoAnalysisResult.java
```java
package com.carboncredit.verificationservice.dto;

import lombok.Data;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
public class GeoAnalysisResult {
    private Long projectId;
    private Double lat;
    private Double lon;

    @JsonProperty("non_green_percentage")
    private Double nonGreenPercentage;

    // VERIFIED, WARNING, HIGH_RISK, FRAUD_RISK
    private String status;

    private String details;
}
```

### File: verification-service/src/main/java/com/carboncredit/verificationservice/dto/GeoAnalysisRequest.java
```java
package com.carboncredit.verificationservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GeoAnalysisRequest {
    private Long projectId;
    private Double lat;
    private Double lon;
    private Integer buffer_m;
}
```

### File: verification-service/src/main/java/com/carboncredit/verificationservice/repository/VerificationRepository.java
```java
package com.carboncredit.verificationservice.repository;

import com.carboncredit.verificationservice.model.VerificationRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VerificationRepository extends JpaRepository<VerificationRequest, Long> {

    List<VerificationRequest> findByOrganizationId(Long organizationId);

    Optional<VerificationRequest> findByReportId(Long reportId);

    List<VerificationRequest> findByStatus(String status);
}
```

### File: verification-service/src/main/java/com/carboncredit/verificationservice/security/SecurityConfig.java
```java
package com.carboncredit.verificationservice.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity // Replaces @EnableGlobalMethodSecurity
@RequiredArgsConstructor
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
                        oauth2 -> oauth2.jwt(org.springframework.security.config.Customizer.withDefaults()));

        return http.build();
    }
}
```

### File: verification-service/src/main/java/com/carboncredit/verificationservice/VerificationServiceApplication.java
```java
package com.carboncredit.verificationservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
@org.springframework.cloud.openfeign.EnableFeignClients
public class VerificationServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(VerificationServiceApplication.class, args);
    }
}
```

### File: verification-service/src/main/java/com/carboncredit/verificationservice/controller/VerificationController.java
```java
package com.carboncredit.verificationservice.controller;

import com.carboncredit.verificationservice.model.VerificationRequest;
import com.carboncredit.verificationservice.service.VerificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/verifications")
@RequiredArgsConstructor
public class VerificationController {

    private final VerificationService verificationService;

    @PostMapping
    public ResponseEntity<VerificationRequest> initiateVerification(@RequestBody VerificationRequest request) {
        return ResponseEntity.ok(verificationService.createVerification(request));
    }

    @GetMapping
    public ResponseEntity<List<VerificationRequest>> getAllVerifications() {
        return ResponseEntity.ok(verificationService.getAllVerifications());
    }

    @GetMapping("/{id}")
    public ResponseEntity<VerificationRequest> getVerificationById(@PathVariable Long id) {
        return ResponseEntity.ok(verificationService.getVerificationById(id));
    }

    @GetMapping("/organization/{orgId}")
    public ResponseEntity<List<VerificationRequest>> getVerificationsByOrganization(@PathVariable Long orgId) {
        return ResponseEntity.ok(verificationService.getVerificationsByOrganization(orgId));
    }

    @PutMapping("/{id}/approve")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('VERIFIER')")
    public ResponseEntity<VerificationRequest> approveVerification(
            @PathVariable Long id,
            @RequestBody Map<String, Object> request) {

        String remarks = (String) request.getOrDefault("remarks", "Manually approved");

        return ResponseEntity.ok(verificationService.approveVerification(id, remarks));
    }
}
```

### File: verification-service/src/main/java/com/carboncredit/verificationservice/model/VerificationRequest.java
```java
package com.carboncredit.verificationservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "verification_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VerificationRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long reportId;

    @Column(nullable = false)
    private Long projectId;

    @Column(nullable = false)
    private Long organizationId;

    @Column(nullable = false)
    private String status; // PENDING, APPROVED, REJECTED

    private LocalDateTime verifiedAt;

    private BigDecimal carbonCreditsCalculated;

    private String remarks;

    @Column(nullable = false)
    private LocalDateTime createdAt;
}
```

### File: verification-service/src/main/java/com/carboncredit/verificationservice/service/VerificationService.java
```java
package com.carboncredit.verificationservice.service;

import com.carboncredit.verificationservice.event.VerificationCompletedEvent;
import com.carboncredit.verificationservice.model.VerificationRequest;
import com.carboncredit.verificationservice.repository.VerificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import com.carboncredit.verificationservice.client.CreditClient;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class VerificationService {

    private final VerificationRepository repository;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final CreditClient creditClient;
    private final com.carboncredit.verificationservice.client.EmissionClient emissionClient;
    private final com.carboncredit.verificationservice.client.GeoClient geoClient;

    /**
     * Kafka Consumer: Listens to emission-topic for new emission reports
     */
    @SuppressWarnings("null")
    public VerificationRequest createVerification(VerificationRequest request) {
        request.setStatus("PENDING");
        request.setCreatedAt(LocalDateTime.now());
        VerificationRequest saved = repository.save(request);
        log.info("Verification request created via API with ID: {}", saved.getId());
        return saved;
    }

    /**
     * Manually approve a verification request
     */
    @SuppressWarnings("null")
    public VerificationRequest approveVerification(Long id, String remarks) {
        VerificationRequest verification = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Verification not found"));

        if (!"PENDING".equals(verification.getStatus())) {
            throw new IllegalStateException("Verification is already " + verification.getStatus());
        }

        // 1. Fetch Emission Report Details (to get Lat/Lon)
        com.carboncredit.verificationservice.dto.EmissionReportDTO report = emissionClient
                .getEmissionReport(verification.getReportId());

        if (report.getLatitude() == null || report.getLongitude() == null) {
            throw new IllegalArgumentException("Emission Report is missing geolocation data. Cannot verify.");
        }

        // 2. Call Geo-Service for Satellite Analysis
        com.carboncredit.verificationservice.dto.GeoAnalysisRequest geoRequest = com.carboncredit.verificationservice.dto.GeoAnalysisRequest
                .builder()
                .projectId(verification.getProjectId())
                .lat(report.getLatitude())
                .lon(report.getLongitude())
                .buffer_m(5000)
                .build();

        com.carboncredit.verificationservice.dto.GeoAnalysisResult geoResult = geoClient.analyzeLand(geoRequest);
        log.info("Geo Analysis Result for Project {}: Status={}, Score={}",
                verification.getProjectId(), geoResult.getStatus(), geoResult.getNonGreenPercentage());

        // 3. Validate Result
        if ("FRAUD_RISK".equals(geoResult.getStatus()) || "HIGH_RISK".equals(geoResult.getStatus())) {
            verification.setStatus("REJECTED");
            verification.setRemarks("Auto-Rejected by Satellite Analysis: " + geoResult.getDetails());
            repository.save(verification);
            throw new IllegalStateException("Verification Rejected: " + geoResult.getDetails());
        }

        // 4. Calculate Credits (Backend Integrity)
        // If WARNING, apply 50% penalty. If VERIFIED, 100%.
        BigDecimal finalCredits = report.getCalculatedEmission();
        if ("WARNING".equals(geoResult.getStatus())) {
            finalCredits = finalCredits.multiply(new BigDecimal("0.5"));
            remarks += " [Penalty Applied: High Non-Green Area]";
        }

        // Ignore the frontend 'creditsCalculated' - we use our trusted source
        verification.setStatus("APPROVED");
        verification.setVerifiedAt(LocalDateTime.now());
        verification.setCarbonCreditsCalculated(finalCredits);
        verification.setRemarks(remarks + " [Geo-Verified]");

        VerificationRequest saved = repository.save(verification);
        log.info("Verification {} approved with {} credits", id, finalCredits);

        // Synchronous Credit Issuance
        try {
            log.info("Initiating synchronous credit issuance for Verification ID: {}", saved.getId());
            creditClient.issueCredits(Map.of(
                    "projectId", saved.getProjectId(),
                    "amount", saved.getCarbonCreditsCalculated(),
                    "ownerId", saved.getOrganizationId()));
            log.info("Credit issuance initiated successfully.");
        } catch (Exception e) {
            log.error("Failed to call Credit Issuance Service", e);
            throw new RuntimeException("Credit Issuance Failed", e);
        }

        emitVerificationCompletedEvent(saved);
        return saved;
    }

    /**
     * Emit VerificationCompletedEvent to Kafka
     */
    private void emitVerificationCompletedEvent(VerificationRequest verification) {
        VerificationCompletedEvent event = VerificationCompletedEvent.builder()
                .verificationId(verification.getId())
                .reportId(verification.getReportId())
                .projectId(verification.getProjectId())
                .organizationId(verification.getOrganizationId())
                .status(verification.getStatus())
                .carbonCreditsCalculated(verification.getCarbonCreditsCalculated())
                .remarks(verification.getRemarks())
                .eventType("VERIFICATION_COMPLETED")
                .build();

        kafkaTemplate.send("EMISSION_VERIFIED", event);
        log.info("VerificationCompletedEvent sent to Kafka for verification ID: {}", verification.getId());
    }

    public List<VerificationRequest> getAllVerifications() {
        return repository.findAll();
    }

    @SuppressWarnings("null")
    public VerificationRequest getVerificationById(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Verification not found"));
    }

    public List<VerificationRequest> getVerificationsByOrganization(Long orgId) {
        return repository.findByOrganizationId(orgId);
    }
}
```

### File: verification-service/src/main/java/com/carboncredit/verificationservice/event/VerificationCompletedEvent.java
```java
package com.carboncredit.verificationservice.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerificationCompletedEvent {
    private Long verificationId;
    private Long reportId;
    private Long projectId;
    private Long organizationId;
    private String status;
    private BigDecimal carbonCreditsCalculated;
    private String remarks;
    private String eventType;
}
```

### File: verification-service/src/main/java/com/carboncredit/verificationservice/client/CreditClient.java
```java
package com.carboncredit.verificationservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import java.util.Map;

@FeignClient(name = "credit-issuance-service")
public interface CreditClient {

    @PostMapping("/api/credits/issue")
    void issueCredits(@RequestBody Map<String, Object> creditRequest);
}
```

### File: verification-service/src/main/java/com/carboncredit/verificationservice/client/GeoClient.java
```java
package com.carboncredit.verificationservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import com.carboncredit.verificationservice.dto.GeoAnalysisRequest;
import com.carboncredit.verificationservice.dto.GeoAnalysisResult;

@FeignClient(name = "geo-service", url = "${geo-service.url:http://localhost:8001}")
public interface GeoClient {

    @PostMapping("/analyze")
    GeoAnalysisResult analyzeLand(@RequestBody GeoAnalysisRequest request);
}
```

### File: verification-service/src/main/java/com/carboncredit/verificationservice/client/EmissionClient.java
```java
package com.carboncredit.verificationservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import com.carboncredit.verificationservice.dto.EmissionReportDTO;

@FeignClient(name = "emission-reporting-service")
public interface EmissionClient {

    @GetMapping("/api/emissions/{id}")
    EmissionReportDTO getEmissionReport(@PathVariable("id") Long id);
}
```

