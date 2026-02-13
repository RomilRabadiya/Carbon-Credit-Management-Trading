### File: emission-reporting-service/Dockerfile
```emission-reporting-service/Dockerfile
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean install -pl common-library -am -DskipTests
RUN mvn clean package -pl emission-reporting-service -am -DskipTests

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=build /app/emission-reporting-service/target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### File: emission-reporting-service/pom.xml
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

    <artifactId>emission-reporting-service</artifactId>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
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

### File: emission-reporting-service/src/main/resources/application.properties
```properties
server.port=8089
spring.application.name=emission-reporting-service
eureka.client.serviceUrl.defaultZone=http://localhost:8761/eureka/

# NeonDB Database Configuration
spring.datasource.url=jdbc:postgresql://ep-cold-fog-a13rf1hh-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channelBinding=require
spring.datasource.username=neondb_owner
spring.datasource.password=npg_zie8fp2IGWkO
spring.datasource.driverClassName=org.postgresql.Driver
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.properties.hibernate.default_schema=emission_reporting
spring.jpa.hibernate.ddl-auto=update
spring.datasource.hikari.data-source-properties.ssl=true
spring.datasource.hikari.data-source-properties.sslmode=require

# Resource Server Configuration
spring.security.oauth2.resourceserver.jwt.issuer-uri=https://accounts.google.com
spring.security.oauth2.resourceserver.jwt.jwk-set-uri=https://www.googleapis.com/oauth2/v3/certs

spring.kafka.bootstrap-servers=localhost:9092
spring.kafka.producer.key-serializer=org.apache.kafka.common.serialization.StringSerializer
spring.kafka.producer.value-serializer=org.springframework.kafka.support.serializer.JsonSerializer

spring.sql.init.mode=always
```

### File: emission-reporting-service/src/main/java/com/carboncredit/emissionservice/dto/ReportRequestDto.java
```java
package com.carboncredit.emissionservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportRequestDto {
    private Long projectId;
    private Long organizationId;
    private String projectType; // REFORESTATION, METHANE_CAPTURE
    private Map<String, Object> data;
    private String evidenceUrl;
    private Double latitude;
    private Double longitude;
}
```

### File: emission-reporting-service/src/main/java/com/carboncredit/emissionservice/EmissionServiceApplication.java
```java
package com.carboncredit.emissionservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
@org.springframework.cloud.openfeign.EnableFeignClients
public class EmissionServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(EmissionServiceApplication.class, args);
    }
}
```

### File: emission-reporting-service/src/main/java/com/carboncredit/emissionservice/security/SecurityConfig.java
```java
package com.carboncredit.emissionservice.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
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

### File: emission-reporting-service/src/main/java/com/carboncredit/emissionservice/dao/EmissionReportDAO.java
```java
package com.carboncredit.emissionservice.dao;

import com.carboncredit.emissionservice.model.EmissionReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmissionReportDAO extends JpaRepository<EmissionReport, Long> {
    boolean existsByProjectIdAndStatus(Long projectId, String status);

    // Check if a report exists for this project in PENDING or VERIFIED state (to
    // prevent spam)
    // For simplicity, we just check generic existence for now, or use a custom
    // query if needed
    // But JpaRepository allows multiple checks
    boolean existsByProjectIdAndStatusIn(Long projectId, java.util.Collection<String> statuses);
}
```

### File: emission-reporting-service/src/main/java/com/carboncredit/emissionservice/controller/EmissionController.java
```java
package com.carboncredit.emissionservice.controller;

import com.carboncredit.common.dto.ResponseEnvelope;
import com.carboncredit.emissionservice.model.EmissionReport;
import com.carboncredit.emissionservice.service.EmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/emissions")
@RequiredArgsConstructor
public class EmissionController {

    private final EmissionService service;

    @PostMapping
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('COMPANY')")
    public ResponseEnvelope<EmissionReport> submitReport(
            @RequestBody com.carboncredit.emissionservice.dto.ReportRequestDto request) {
        return ResponseEnvelope.success(service.submitReport(request), "Emission report submitted successfully");
    }
}
```

### File: emission-reporting-service/src/main/java/com/carboncredit/emissionservice/model/EmissionReport.java
```java
package com.carboncredit.emissionservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "emission_reports")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmissionReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long projectId;

    private Long organizationId;

    @Column(nullable = false)
    private String projectType; // REFORESTATION, METHANE_CAPTURE

    @Column(columnDefinition = "jsonb")
    private String emissionData; // Serialized JSON

    private BigDecimal calculatedEmission;

    private String evidenceUrl;

    @Column(nullable = false)
    private Double latitude;

    @Column(nullable = false)
    private Double longitude;

    private String status; // PENDING_VERIFICATION, VERIFIED, REJECTED

    private LocalDateTime createdAt;
}
```

### File: emission-reporting-service/src/main/java/com/carboncredit/emissionservice/service/EmissionService.java
```java
package com.carboncredit.emissionservice.service;

import com.carboncredit.emissionservice.event.EmissionReportedEvent;
import com.carboncredit.emissionservice.dao.EmissionReportDAO;
import com.carboncredit.emissionservice.dto.ReportRequestDto;
import com.carboncredit.emissionservice.model.EmissionReport;
import com.carboncredit.emissionservice.strategy.EmissionCalculationStrategy;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@Slf4j
public class EmissionService {

    private final EmissionReportDAO emissionReportDAO;
    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final ObjectMapper objectMapper;
    private final Map<String, EmissionCalculationStrategy> strategyMap;
    private final com.carboncredit.emissionservice.client.VerificationClient verificationClient;

    // Lombok's RequiredArgsConstructor will handle injection of final fields.
    // We need to initialize the map, though.
    // Actually, it's better to inject the list and convert it.
    // But since `strategyMap` is final, we can't assign it in PostConstruct easily
    // without removing final.
    // Let's keep it final and use constructor injection manually but cleaner.

    public EmissionService(EmissionReportDAO emissionReportDAO,
            KafkaTemplate<String, Object> kafkaTemplate,
            ObjectMapper objectMapper,
            List<EmissionCalculationStrategy> strategies,
            com.carboncredit.emissionservice.client.VerificationClient verificationClient) {
        this.emissionReportDAO = emissionReportDAO;
        this.kafkaTemplate = kafkaTemplate;
        this.objectMapper = objectMapper;
        this.verificationClient = verificationClient;
        this.strategyMap = strategies.stream()
                .collect(Collectors.toMap(EmissionCalculationStrategy::getProjectType, Function.identity()));
    }

    @SuppressWarnings("null")
    public EmissionReport submitReport(ReportRequestDto request) {
        // DUPLICATE CHECK: Don't allow submission if one is already pending or verified
        if (emissionReportDAO.existsByProjectIdAndStatusIn(
                request.getProjectId(),
                java.util.List.of("PENDING_VERIFICATION", "VERIFIED"))) {
            throw new IllegalStateException(
                    "A report for Project ID " + request.getProjectId() + " is already Pending or Verified.");
        }

        // MRV Logic: Evidence is mandatory
        if (request.getEvidenceUrl() == null || request.getEvidenceUrl().isEmpty()) {
            throw new IllegalArgumentException(
                    "MRV Violation: Monitoring evidence is required for emission reporting.");
        }

        EmissionCalculationStrategy strategy = strategyMap.get(request.getProjectType());
        if (strategy == null) {
            throw new IllegalArgumentException("Invalid or unsupported Project Type: " + request.getProjectType());
        }

        BigDecimal calculatedEmission = strategy.calculateEmission(request.getData());

        String emissionDataJson;
        try {
            emissionDataJson = objectMapper.writeValueAsString(request.getData());
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Error serializing emission data", e);
        }

        EmissionReport report = EmissionReport.builder()
                .projectId(request.getProjectId())
                .organizationId(request.getOrganizationId())
                .projectType(request.getProjectType())
                .emissionData(emissionDataJson)
                .calculatedEmission(calculatedEmission)
                .evidenceUrl(request.getEvidenceUrl())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .status("PENDING_VERIFICATION")
                .createdAt(LocalDateTime.now())
                .build();

        EmissionReport savedReport = emissionReportDAO.save(report);
        log.info("Emission Report saved: {}", savedReport.getId());

        // Synchronous Verification Call (Feign)
        // Creating Map payload similar to what DTO expects
        Map<String, Object> verificationPayload = Map.of(
                "reportId", savedReport.getId(),
                "projectId", savedReport.getProjectId(),
                "organizationId", savedReport.getOrganizationId() != null ? savedReport.getOrganizationId() : 0L);
        try {
            verificationClient.initiateVerification(verificationPayload);
            log.info("Verification initiated validation via Feign Client for Report ID: {}", savedReport.getId());
        } catch (Exception e) {
            log.error("Failed to initiate verification via Feign", e);
            // Non-blocking for now, or throw exception depending on business requirement
        }

        // Publish Event (Notification Only now)
        EmissionReportedEvent event = EmissionReportedEvent.builder()
                .reportId(savedReport.getId())
                .projectId(savedReport.getProjectId())
                .organizationId(request.getOrganizationId())
                .carbonAmount(savedReport.getCalculatedEmission())
                .unit("TONNE_CO2E")
                .description("Emission Report for Project " + savedReport.getProjectId())
                .eventType("EMISSION_REPORTED")
                .build();

        kafkaTemplate.send("emission-topic", event);
        log.info("EmissionReportedEvent sent for Report ID: {}", savedReport.getId());

        return savedReport;
    }
}
```

### File: emission-reporting-service/src/main/java/com/carboncredit/emissionservice/event/EmissionReportedEvent.java
```java
package com.carboncredit.emissionservice.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmissionReportedEvent {
    private String eventId;
    private Long reportId;
    private Long projectId;
    private Long organizationId;
    private BigDecimal carbonAmount;
    private String unit; // e.g., "TONNE_CO2E"
    private String description;
    private String eventType; // "EMISSION_REPORTED"
}
```

### File: emission-reporting-service/src/main/java/com/carboncredit/emissionservice/client/VerificationClient.java
```java
package com.carboncredit.emissionservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import java.util.Map;

@FeignClient(name = "verification-service")
public interface VerificationClient {

    @PostMapping("/api/verifications")
    void initiateVerification(@RequestBody Map<String, Object> verificationRequest);
}
```

### File: emission-reporting-service/src/main/java/com/carboncredit/emissionservice/strategy/MethaneCaptureStrategy.java
```java
package com.carboncredit.emissionservice.strategy;

import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.util.Map;

@Component
public class MethaneCaptureStrategy implements EmissionCalculationStrategy {
    @Override
    public BigDecimal calculateEmission(Map<String, Object> data) {
        // Example: volume in m3 * factor (0.015 tonnes CO2 per m3)
        if (!data.containsKey("volume_m3")) {
            throw new IllegalArgumentException("Methane Methane strategy requires 'volume_m3'");
        }
        double volume = Double.parseDouble(data.get("volume_m3").toString());
        return BigDecimal.valueOf(volume * 0.015);
    }

    @Override
    public String getProjectType() {
        return "METHANE_CAPTURE";
    }
}
```

### File: emission-reporting-service/src/main/java/com/carboncredit/emissionservice/strategy/EmissionCalculationStrategy.java
```java
package com.carboncredit.emissionservice.strategy;

import java.math.BigDecimal;
import java.util.Map;

public interface EmissionCalculationStrategy {
    BigDecimal calculateEmission(Map<String, Object> data);

    String getProjectType();
}
```

### File: emission-reporting-service/src/main/java/com/carboncredit/emissionservice/strategy/ReforestationStrategy.java
```java
package com.carboncredit.emissionservice.strategy;

import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.util.Map;

@Component
public class ReforestationStrategy implements EmissionCalculationStrategy {
    @Override
    public BigDecimal calculateEmission(Map<String, Object> data) {
        // Example: area in hectares * factor (10.5 tonnes CO2 per hectare)
        if (!data.containsKey("area_hectares")) {
            throw new IllegalArgumentException("Reforestation strategy requires 'area_hectares'");
        }
        double area = Double.parseDouble(data.get("area_hectares").toString());
        return BigDecimal.valueOf(area * 10.5);
    }

    @Override
    public String getProjectType() {
        return "REFORESTATION";
    }
}
```

