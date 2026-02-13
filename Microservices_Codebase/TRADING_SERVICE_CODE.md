### File: trading-service/Dockerfile
```trading-service/Dockerfile
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean install -pl common-library -am -DskipTests
RUN mvn clean package -pl trading-service -am -DskipTests

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=build /app/trading-service/target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### File: trading-service/pom.xml
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

    <artifactId>trading-service</artifactId>

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

### File: trading-service/src/main/resources/application.properties
```properties
server.port=8086
spring.application.name=trading-service
eureka.client.serviceUrl.defaultZone=http://localhost:8761/eureka/

# NeonDB Database Configuration
spring.datasource.url=jdbc:postgresql://ep-cold-fog-a13rf1hh-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channelBinding=require
spring.datasource.username=neondb_owner
spring.datasource.password=npg_zie8fp2IGWkO
spring.datasource.driverClassName=org.postgresql.Driver
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.properties.hibernate.default_schema=trading
spring.jpa.hibernate.ddl-auto=update
spring.datasource.hikari.data-source-properties.ssl=true
spring.datasource.hikari.data-source-properties.sslmode=require

# Resource Server Configuration
spring.security.oauth2.resourceserver.jwt.issuer-uri=https://accounts.google.com
spring.security.oauth2.resourceserver.jwt.jwk-set-uri=https://www.googleapis.com/oauth2/v3/certs

# Kafka Configuration
spring.kafka.bootstrap-servers=${KAFKA_BOOTSTRAP_SERVERS:localhost:9092}

# Kafka Consumer (for CreditIssuedEvent)
spring.kafka.consumer.group-id=trading-group
spring.kafka.consumer.auto-offset-reset=earliest
spring.kafka.consumer.key-deserializer=org.apache.kafka.common.serialization.StringDeserializer
spring.kafka.consumer.value-deserializer=org.springframework.kafka.support.serializer.JsonDeserializer
spring.kafka.consumer.properties.spring.json.trusted.packages=com.carboncredit.common.event

# Kafka Producer (for future trade events)
spring.kafka.producer.key-serializer=org.apache.kafka.common.serialization.StringSerializer
spring.kafka.producer.value-serializer=org.springframework.kafka.support.serializer.JsonSerializer
```

### File: trading-service/src/main/java/com/carboncredit/tradingservice/dto/CarbonCreditDTO.java
```java
package com.carboncredit.tradingservice.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CarbonCreditDTO {
    private Long id;
    private String serialNumber;
    private Long ownerId;
    private Double amount;
    private String status;
    private LocalDateTime issuanceDate;
}
```

### File: trading-service/src/main/java/com/carboncredit/tradingservice/dto/TransactionResponse.java
```java
package com.carboncredit.tradingservice.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class TransactionResponse {
    private String message;
    private Long transactionId;
}
```

### File: trading-service/src/main/java/com/carboncredit/tradingservice/config/FeignConfig.java
```java
package com.carboncredit.tradingservice.config;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;

@Configuration
public class FeignConfig {

    @Bean
    public RequestInterceptor requestInterceptor() {
        return new RequestInterceptor() {
            @Override
            public void apply(RequestTemplate template) {
                Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
                if (authentication instanceof JwtAuthenticationToken) {
                    JwtAuthenticationToken jwtToken = (JwtAuthenticationToken) authentication;
                    template.header("Authorization", "Bearer " + jwtToken.getToken().getTokenValue());
                }
            }
        };
    }
}
```

### File: trading-service/src/main/java/com/carboncredit/tradingservice/security/SecurityConfig.java
```java
package com.carboncredit.tradingservice.security;

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

### File: trading-service/src/main/java/com/carboncredit/tradingservice/dao/TradeDAO.java
```java
package com.carboncredit.tradingservice.dao;

import com.carboncredit.tradingservice.model.Trade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TradeDAO extends JpaRepository<Trade, Long> {
    List<Trade> findBySellerId(Long sellerId);

    List<Trade> findByBuyerId(Long buyerId);

    List<Trade> findByCreditId(Long creditId);
}
```

### File: trading-service/src/main/java/com/carboncredit/tradingservice/dao/TradableCreditDAO.java
```java
package com.carboncredit.tradingservice.dao;

import com.carboncredit.tradingservice.model.TradableCredit;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TradableCreditDAO extends JpaRepository<TradableCredit, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT t FROM TradableCredit t WHERE t.id = :id")
    Optional<TradableCredit> findByIdForUpdate(Long id);

    Optional<TradableCredit> findBySerialNumber(String serialNumber);
}
```

### File: trading-service/src/main/java/com/carboncredit/tradingservice/dao/ListingRepository.java
```java
package com.carboncredit.tradingservice.dao;

import com.carboncredit.tradingservice.model.Listing;
import com.carboncredit.tradingservice.model.ListingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ListingRepository extends JpaRepository<Listing, UUID> {
    List<Listing> findByStatus(ListingStatus status);

    List<Listing> findBySellerId(Long sellerId);

    // To prevent double listing
    boolean existsByCreditIdAndStatus(Long creditId, ListingStatus status);
}
```

### File: trading-service/src/main/java/com/carboncredit/tradingservice/controller/TradingController.java
```java
package com.carboncredit.tradingservice.controller;

import com.carboncredit.tradingservice.dto.TransactionResponse;
import com.carboncredit.tradingservice.service.TradingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/trading")
@RequiredArgsConstructor
@Slf4j
public class TradingController {

    private final TradingService tradingService;
    private final com.carboncredit.tradingservice.client.UserClient userClient;

    @PostMapping("/list")
    @org.springframework.security.access.prepost.PreAuthorize("hasRole('SELLER')")
    public ResponseEntity<com.carboncredit.tradingservice.model.Listing> listCredit(
            @RequestBody java.util.Map<String, Object> request,
            @RequestHeader("X-Organization-Id") Long organizationId) {

        Long creditId = ((Number) request.get("creditId")).longValue();
        java.math.BigDecimal price = new java.math.BigDecimal(request.get("price").toString());

        return ResponseEntity.ok(tradingService.createListing(creditId, organizationId, price));
    }

    @GetMapping("/listings")
    public ResponseEntity<java.util.List<com.carboncredit.tradingservice.model.Listing>> getActiveListings() {
        return ResponseEntity.ok(tradingService.getActiveListings());
    }

    @PostMapping("/buy")
    public ResponseEntity<TransactionResponse> buyCredit(
            @RequestBody java.util.Map<String, String> request) {

        // Verify user and get organization ID
        try {
            com.carboncredit.common.dto.ResponseEnvelope<Object> userResponse = userClient.getCurrentUser();
            // userResponse.getData() is likely a LinkedHashMap because of JSON
            // deserialization if DTO not shared
            // We need to extract extracted role and organization ID
            // Ideally use specific DTO, but for now map it.

            java.util.Map<String, Object> userData = (java.util.Map<String, Object>) userResponse.getData();
            String role = (String) userData.get("role");

            // Check if user is Organization or has Buyer permissions
            if (!"ORGANIZATION".equalsIgnoreCase(role) && !"BUYER".equalsIgnoreCase(role)) {
                return ResponseEntity.status(403)
                        .body(new TransactionResponse("User does not have permission to buy", null));
            }

            Object orgIdObj = userData.get("organizationId");
            if (orgIdObj == null) {
                return ResponseEntity.status(403)
                        .body(new TransactionResponse("User is not associated with an organization", null));
            }

            Long buyerId = ((Number) orgIdObj).longValue();

            java.util.UUID listingId = java.util.UUID.fromString(request.get("listingId"));
            return ResponseEntity.ok(tradingService.buyCredit(listingId, buyerId));

        } catch (Exception e) {
            log.error("Error verifying user for buy request", e);
            return ResponseEntity.status(401).body(new TransactionResponse("Unauthorized: " + e.getMessage(), null));
        }
    }

    @PostMapping("/retire/{creditId}")
    @org.springframework.security.access.prepost.PreAuthorize("hasAnyRole('BUYER', 'SELLER')")
    public ResponseEntity<TransactionResponse> retireCredit(
            @PathVariable Long creditId,
            @RequestHeader("X-Organization-Id") Long organizationId) {

        log.info("Received retirement request for credit {} from org {}", creditId, organizationId);
        // ... (Keep existing)
        try {
            TransactionResponse response = tradingService.retireCredit(creditId, organizationId);
            return ResponseEntity.ok(response);
        } catch (IllegalStateException e) {
            log.warn("Retirement failed: {}", e.getMessage());
            return ResponseEntity.badRequest().body(new TransactionResponse(e.getMessage(), null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            log.error("Unexpected error retiring credit", e);
            return ResponseEntity.internalServerError().body(new TransactionResponse("Internal Server Error", null));
        }
    }
}
```

### File: trading-service/src/main/java/com/carboncredit/tradingservice/TradingServiceApplication.java
```java
package com.carboncredit.tradingservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
@org.springframework.cloud.openfeign.EnableFeignClients
public class TradingServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(TradingServiceApplication.class, args);
    }
}
```

### File: trading-service/src/main/java/com/carboncredit/tradingservice/model/ListingStatus.java
```java
package com.carboncredit.tradingservice.model;

public enum ListingStatus {
    ACTIVE,
    PENDING,
    SOLD,
    CANCELLED
}
```

### File: trading-service/src/main/java/com/carboncredit/tradingservice/model/TradableCredit.java
```java
package com.carboncredit.tradingservice.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.math.BigDecimal;

/**
 * Local replica of CarbonCredit for trading purposes.
 * Allows locking and efficient querying without calling Credit Service.
 */
@Entity
@Table(name = "tradable_credits")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TradableCredit {

    @Id
    private Long id; // Matches Credit ID from Credit Service

    @Column(nullable = false, unique = true)
    private String serialNumber;

    @Column(nullable = false)
    private Long ownerId;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(nullable = false)
    private String status; // ACTIVE, RETIRED
}
```

### File: trading-service/src/main/java/com/carboncredit/tradingservice/model/Listing.java
```java
package com.carboncredit.tradingservice.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "listings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Listing {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private Long creditId;

    @Column(nullable = false)
    private Long sellerId;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerUnit;

    // Use string storage for enum to be safe
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ListingStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
```

### File: trading-service/src/main/java/com/carboncredit/tradingservice/model/TradeStatus.java
```java
package com.carboncredit.tradingservice.model;

public enum TradeStatus {
    PENDING,
    COMPLETED,
    CANCELLED,
    FAILED
}
```

### File: trading-service/src/main/java/com/carboncredit/tradingservice/model/Trade.java
```java
package com.carboncredit.tradingservice.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "trades")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Trade {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long sellerId;

    @Column(nullable = true)
    private Long buyerId;

    @Column(nullable = true)
    private java.util.UUID listingId;

    @Column(nullable = false)
    private Long creditId;

    @Column(nullable = true)
    private BigDecimal pricePerUnit;

    @Column(nullable = true)
    private BigDecimal totalAmount;

    @Enumerated(EnumType.STRING)
    private TradeStatus status; // PENDING, COMPLETED, CANCELLED

    @Column(nullable = false)
    private String transactionType; // TRADE, RETIRE

    private LocalDateTime transactionDate;
}
```

### File: trading-service/src/main/java/com/carboncredit/tradingservice/consumer/CreditIssuedEventConsumer.java
```java
package com.carboncredit.tradingservice.consumer;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class CreditIssuedEventConsumer {

    // Legacy consumer, replaced by Feign client calls.

    // @KafkaListener(topics = "${kafka.topic.credit-issued:credit-issued-topic}",
    // groupId = "${spring.kafka.consumer.group-id:trading-service-group}")
    // @Transactional
    // public void consumeCreditIssuedEvent(CreditIssuedEvent event, Acknowledgment
    // ack) {
    // log.info("Received CreditIssuedEvent: {}", event.getSerialNumber());

    // // Check if already exists (Idempotency)
    // if (tradableCreditDAO.existsById(event.getCreditId())) {
    // log.warn("Credit {} already exists in trading DB", event.getCreditId());
    // ack.acknowledge();
    // return;
    // }

    // TradableCredit credit = TradableCredit.builder()
    // .id(event.getCreditId())
    // .serialNumber(event.getSerialNumber())
    // .ownerId(event.getOrganizationId())
    // .amount(event.getCreditAmount())
    // .status("ACTIVE")
    // .build();

    // tradableCreditDAO.save(credit);
    // log.info("Persisted TradableCredit: {}", credit.getSerialNumber());
    // ack.acknowledge();
    // }
}
```

### File: trading-service/src/main/java/com/carboncredit/tradingservice/service/TradingService.java
```java
package com.carboncredit.tradingservice.service;

import com.carboncredit.common.event.CreditRetiredEvent;
import com.carboncredit.tradingservice.client.CreditClient;
import com.carboncredit.tradingservice.dao.TradeDAO;
import com.carboncredit.tradingservice.dto.CarbonCreditDTO;
import com.carboncredit.tradingservice.dto.TransactionResponse;
import com.carboncredit.tradingservice.model.Trade;
import com.carboncredit.tradingservice.model.TradeStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Slf4j
public class TradingService {

    private final CreditClient creditClient;
    private final TradeDAO tradeDAO;
    private final com.carboncredit.tradingservice.dao.ListingRepository listingRepository;
    private final com.carboncredit.tradingservice.client.OrganizationClient organizationClient;
    private final KafkaTemplate<String, Object> kafkaTemplate;

    @Value("${kafka.topic.credit-retired:credit-retired-topic}")
    private String creditRetiredTopic;

    @Value("${kafka.topic.trade-completed:trade-completed-topic}")
    private String tradeCompletedTopic;

    // ... (keep existing methods until buyCredit)

    /**
     * Buy a listed credit
     */
    @Transactional(isolation = Isolation.READ_COMMITTED)
    @SuppressWarnings("null")
    public TransactionResponse buyCredit(java.util.UUID listingId, Long buyerId) {
        log.info("Processing buy request. Listing: {}, Buyer: {}", listingId, buyerId);

        // 1. Find Listing
        com.carboncredit.tradingservice.model.Listing listing = listingRepository.findById(listingId)
                .orElseThrow(() -> new IllegalArgumentException("Listing not found"));

        if (!com.carboncredit.tradingservice.model.ListingStatus.ACTIVE.equals(listing.getStatus())) {
            throw new IllegalStateException("Listing is not active");
        }

        if (listing.getSellerId().equals(buyerId)) {
            throw new IllegalArgumentException("Cannot buy your own credit");
        }

        Long creditId = listing.getCreditId();
        Long sellerId = listing.getSellerId();
        java.math.BigDecimal price = listing.getPricePerUnit();

        // 2. Process Payment (Deduct from Buyer)
        try {
            organizationClient.deductBalance(buyerId, price);
            log.info("Balance deducted from buyer {}", buyerId);
        } catch (Exception e) {
            log.error("Payment failed for buyer {}", buyerId, e);
            throw new IllegalStateException("Payment failed: " + e.getMessage());
        }

        // 3. Execute Transfer (Remote Call)
        try {
            java.util.Map<String, Long> transferRequest = new java.util.HashMap<>();
            transferRequest.put("currentOwnerId", sellerId);
            transferRequest.put("newOwnerId", buyerId);

            creditClient.transferCredit(creditId, transferRequest);
        } catch (Exception e) {
            log.error("Failed to transfer credit in Credit Service", e);
            // REFUND BUYER
            organizationClient.addBalance(buyerId, price);
            throw new RuntimeException("Transfer failed: " + e.getMessage());
        }

        // 4. Pay Seller
        try {
            organizationClient.addBalance(sellerId, price);
        } catch (Exception e) {
            log.error("Failed to pay seller {}. Manual reconciliation needed.", sellerId, e);
            // This is a critical failure state - in real world, we need a reconciliation
            // job.
        }

        // 5. Update Listing Status
        listing.setStatus(com.carboncredit.tradingservice.model.ListingStatus.SOLD);
        listingRepository.save(listing);

        // 6. Record Trade locally
        Trade trade = Trade.builder()
                .sellerId(sellerId)
                .buyerId(buyerId)
                .creditId(creditId)
                .listingId(listingId)
                .pricePerUnit(price)
                .transactionType("BUY")
                .status(TradeStatus.COMPLETED)
                .transactionDate(LocalDateTime.now())
                .build();

        Trade savedTrade = tradeDAO.save(trade);
        log.info("Trade recorded. ID: {}", savedTrade.getId());

        // 7. Publish Trade Completed Event (For Audit Ledger)
        com.carboncredit.common.event.TradeCompletedEvent event = com.carboncredit.common.event.TradeCompletedEvent
                .builder()
                .listingId(listingId)
                .buyerId(buyerId)
                .sellerId(sellerId)
                .creditId(creditId)
                .pricePerUnit(price)
                .timestamp(LocalDateTime.now())
                .eventType("TRADE_COMPLETED")
                .build();

        kafkaTemplate.send(tradeCompletedTopic, event);

        return new TransactionResponse("Credit purchased successfully", savedTrade.getId());
    }

    @Transactional
    @SuppressWarnings("null")
    public com.carboncredit.tradingservice.model.Listing createListing(Long creditId, Long sellerId,
            java.math.BigDecimal price) {
        log.info("Creating listing for credit {} by seller {} at price {}", creditId, sellerId, price);

        // 1. Verify Credit Ownership & Status
        CarbonCreditDTO credit = creditClient.getCreditById(creditId);
        if (credit == null)
            throw new IllegalArgumentException("Credit not found");

        if (!credit.getOwnerId().equals(sellerId)) {
            throw new IllegalArgumentException("You do not own this credit");
        }
        if (!"ACTIVE".equals(credit.getStatus())) {
            throw new IllegalStateException("Credit must be ACTIVE to list");
        }

        // 2. Check for existing active listing
        boolean exists = listingRepository.existsByCreditIdAndStatus(creditId,
                com.carboncredit.tradingservice.model.ListingStatus.ACTIVE);
        if (exists) {
            throw new IllegalStateException("Credit is already listed");
        }

        // 3. Create Listing
        com.carboncredit.tradingservice.model.Listing listing = com.carboncredit.tradingservice.model.Listing.builder()
                .creditId(creditId)
                .sellerId(sellerId)
                .pricePerUnit(price)
                .status(com.carboncredit.tradingservice.model.ListingStatus.ACTIVE)
                .build();

        return listingRepository.save(listing);
    }

    @Transactional(readOnly = true)
    public java.util.List<com.carboncredit.tradingservice.model.Listing> getActiveListings() {
        return listingRepository.findAll().stream()
                .filter(l -> com.carboncredit.tradingservice.model.ListingStatus.ACTIVE.equals(l.getStatus()))
                .collect(java.util.stream.Collectors.toList());
    }

    @Transactional
    @SuppressWarnings("null")
    public TransactionResponse retireCredit(Long creditId, Long organizationId) {
        log.info("Processing retirement request for credit {} by org {}", creditId, organizationId);

        // 1. Verify Ownership
        CarbonCreditDTO credit = creditClient.getCreditById(creditId);
        if (credit == null)
            throw new IllegalArgumentException("Credit not found");
        if (!credit.getOwnerId().equals(organizationId)) {
            throw new IllegalArgumentException("You do not own this credit");
        }

        // 2. Prepare Retirement Request
        java.util.Map<String, String> request = new java.util.HashMap<>();
        request.put("beneficiary", "Self (Organization " + organizationId + ")");
        request.put("reason", "Voluntary Retirement via Trading Service");

        // 3. Call Credit Service to Retire
        try {
            creditClient.retireCredit(creditId, request);
        } catch (Exception e) {
            log.error("Failed to retire credit in Credit Service", e);
            throw new IllegalStateException("Retirement failed: " + e.getMessage());
        }

        // 4. Record "Trade" as Retirement (Audit Trail)
        Trade trade = Trade.builder()
                .sellerId(organizationId)
                .buyerId(null) // No buyer
                .creditId(creditId)
                .listingId(null)
                .pricePerUnit(java.math.BigDecimal.ZERO)
                .transactionType("RETIRE")
                .status(TradeStatus.COMPLETED)
                .transactionDate(LocalDateTime.now())
                .build();

        tradeDAO.save(trade);

        // 5. Publish Event
        CreditRetiredEvent event = CreditRetiredEvent.builder()
                .creditId(creditId)
                .ownerId(organizationId)
                .serialNumber(credit.getSerialNumber())
                .reason("Voluntary Retirement")
                .transactionId(trade.getId())
                .timestamp(LocalDateTime.now())
                .eventType("CREDIT_RETIRED")
                .build();
        // Since we don't have a specific topic for this in this service config yet, we
        // can use the creditRetiredTopic if configured
        // or just rely on the CreditService's event. But let's send it if we have the
        // topic.
        if (creditRetiredTopic != null && !creditRetiredTopic.isEmpty()) {
            kafkaTemplate.send(creditRetiredTopic, event);
        }

        return new TransactionResponse("Credit retired successfully", trade.getId());
    }
}
```

### File: trading-service/src/main/java/com/carboncredit/tradingservice/client/OrganizationClient.java
```java
package com.carboncredit.tradingservice.client;

import com.carboncredit.common.dto.ResponseEnvelope;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import java.math.BigDecimal;

@FeignClient(name = "organization-service")
public interface OrganizationClient {

    @PostMapping("/api/orgs/{id}/balance/deduct")
    ResponseEnvelope<Void> deductBalance(@PathVariable("id") Long id, @RequestBody BigDecimal amount);

    @PostMapping("/api/orgs/{id}/balance/add")
    ResponseEnvelope<Void> addBalance(@PathVariable("id") Long id, @RequestBody BigDecimal amount);
}
```

### File: trading-service/src/main/java/com/carboncredit/tradingservice/client/CreditClient.java
```java
package com.carboncredit.tradingservice.client;

import com.carboncredit.tradingservice.dto.CarbonCreditDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "credit-issuance-service")
public interface CreditClient {

        @GetMapping("/api/credits/{creditId}")
        CarbonCreditDTO getCreditById(@PathVariable("creditId") Long creditId);

        @org.springframework.web.bind.annotation.PostMapping("/api/credits/{creditId}/transfer")
        void transferCredit(@PathVariable("creditId") Long creditId,
                        @org.springframework.web.bind.annotation.RequestBody java.util.Map<String, Long> request);

        @org.springframework.web.bind.annotation.PostMapping("/api/credits/{creditId}/retire")
        void retireCredit(@PathVariable("creditId") Long creditId,
                        @org.springframework.web.bind.annotation.RequestBody java.util.Map<String, String> request);
}
```

### File: trading-service/src/main/java/com/carboncredit/tradingservice/client/UserClient.java
```java
package com.carboncredit.tradingservice.client;

import com.carboncredit.common.dto.ResponseEnvelope;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;

@FeignClient(name = "user-identity-service")
public interface UserClient {

    @GetMapping("/api/users/current")
    ResponseEnvelope<Object> getCurrentUser();
}
```

