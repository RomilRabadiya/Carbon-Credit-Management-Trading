### File: organization-service/Dockerfile
```organization-service/Dockerfile
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean install -pl common-library -am -DskipTests
RUN mvn clean package -pl organization-service -am -DskipTests

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=build /app/organization-service/target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### File: organization-service/pom.xml
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

    <artifactId>organization-service</artifactId>

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

### File: organization-service/src/main/resources/application.properties
```properties
server.port=8083
spring.application.name=organization-service
eureka.client.serviceUrl.defaultZone=http://localhost:8761/eureka/

# NeonDB Database Configuration
spring.datasource.url=jdbc:postgresql://ep-cold-fog-a13rf1hh-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channelBinding=require
spring.datasource.username=neondb_owner
spring.datasource.password=npg_zie8fp2IGWkO
spring.datasource.driverClassName=org.postgresql.Driver
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.properties.hibernate.default_schema=organization
spring.jpa.hibernate.ddl-auto=update
spring.datasource.hikari.data-source-properties.ssl=true
spring.datasource.hikari.data-source-properties.sslmode=require


# Resource Server Configuration
spring.security.oauth2.resourceserver.jwt.issuer-uri=https://accounts.google.com
spring.security.oauth2.resourceserver.jwt.jwk-set-uri=https://www.googleapis.com/oauth2/v3/certs

# Kafka Configuration (for future organization events)
spring.kafka.bootstrap-servers=localhost:9092
spring.kafka.producer.key-serializer=org.apache.kafka.common.serialization.StringSerializer
spring.kafka.producer.value-serializer=org.springframework.kafka.support.serializer.JsonSerializer

# Eureka Configuration
eureka.instance.hostname=localhost
eureka.instance.prefer-ip-address=false
```

### File: organization-service/src/main/java/com/carboncredit/organizationservice/repository/OrganizationRepository.java
```java
package com.carboncredit.organizationservice.repository;

import com.carboncredit.organizationservice.model.Organization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface OrganizationRepository extends JpaRepository<Organization, Long> {
    Optional<Organization> findByName(String name);

    boolean existsByName(String name);

    boolean existsByContactEmail(String contactEmail);
}
```

### File: organization-service/src/main/java/com/carboncredit/organizationservice/OrganizationServiceApplication.java
```java
package com.carboncredit.organizationservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class OrganizationServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(OrganizationServiceApplication.class, args);
    }
}
```

### File: organization-service/src/main/java/com/carboncredit/organizationservice/security/SecurityConfig.java
```java
package com.carboncredit.organizationservice.security;

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

### File: organization-service/src/main/java/com/carboncredit/organizationservice/controller/OrganizationController.java
```java
package com.carboncredit.organizationservice.controller;

import com.carboncredit.common.dto.ResponseEnvelope;
import com.carboncredit.organizationservice.model.Organization;
import com.carboncredit.organizationservice.service.OrganizationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/organizations")
@RequiredArgsConstructor
public class OrganizationController {

    private final OrganizationService service;

    @PostMapping
    public ResponseEnvelope<Organization> registerOrganization(@RequestBody Organization org) {
        Organization savedOrg = service.registerOrganization(org);
        return ResponseEnvelope.success(savedOrg, "Organization registered successfully");
    }

    @GetMapping("/{id}")
    public ResponseEnvelope<Organization> getOrganization(@PathVariable Long id) {
        return ResponseEnvelope.success(service.getOrganization(id), "Organization found");
    }

    @GetMapping
    public ResponseEnvelope<List<Organization>> getAll() {
        return ResponseEnvelope.success(service.getAllOrganizations(), "Organizations retrieved");
    }

    @PostMapping("/{id}/balance/deduct")
    // Secured: Only Internal Service (Trading) or Admin should call this.
    // For now, leaving loosely guarded or use a "SYSTEM" role if available.
    public ResponseEnvelope<Void> deductBalance(@PathVariable Long id, @RequestBody java.math.BigDecimal amount) {
        service.deductBalance(id, amount);
        return ResponseEnvelope.success(null, "Balance deducted");
    }

    @PostMapping("/{id}/balance/add")
    // Secured: Faucet for Demo (Authorized Users) or Internal
    @org.springframework.security.access.prepost.PreAuthorize("isAuthenticated()")
    public ResponseEnvelope<Void> addBalance(@PathVariable Long id, @RequestBody java.math.BigDecimal amount) {
        service.addBalance(id, amount);
        return ResponseEnvelope.success(null, "Balance added");
    }
}
```

### File: organization-service/src/main/java/com/carboncredit/organizationservice/model/Organization.java
```java
package com.carboncredit.organizationservice.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "organizations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Organization {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    private String type; // e.g. "COMPANY", "VERIFIER", "REGULATOR"

    private String address;
    private String contactEmail;

    @Column(nullable = false)
    private java.math.BigDecimal balance; // Default 0.00
}
```

### File: organization-service/src/main/java/com/carboncredit/organizationservice/service/OrganizationService.java
```java
package com.carboncredit.organizationservice.service;

import com.carboncredit.organizationservice.model.Organization;
import com.carboncredit.organizationservice.repository.OrganizationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrganizationService {

    private final OrganizationRepository repository;

    public Organization registerOrganization(Organization org) {
        log.info("Registering new organization: {}", org.getName());

        if (repository.existsByName(org.getName())) {
            throw new IllegalArgumentException("Organization with name '" + org.getName() + "' already exists.");
        }
        if (repository.existsByContactEmail(org.getContactEmail())) {
            throw new IllegalArgumentException(
                    "Organization with email '" + org.getContactEmail() + "' already exists.");
        }

        if (org.getBalance() == null) {
            org.setBalance(java.math.BigDecimal.ZERO);
        }
        return repository.save(org);
    }

    public void deductBalance(Long id, java.math.BigDecimal amount) {
        Organization org = getOrganization(id);
        if (org.getBalance().compareTo(amount) < 0) {
            throw new IllegalStateException("Insufficient funds");
        }
        org.setBalance(org.getBalance().subtract(amount));
        repository.save(org);
    }

    public void addBalance(Long id, java.math.BigDecimal amount) {
        Organization org = getOrganization(id);
        org.setBalance(org.getBalance().add(amount));
        repository.save(org);
    }

    @SuppressWarnings("null")
    public Organization getOrganization(Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Organization not found with id: " + id));
    }

    public List<Organization> getAllOrganizations() {
        return repository.findAll();
    }
}
```

