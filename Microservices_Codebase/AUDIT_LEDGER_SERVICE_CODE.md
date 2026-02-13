### File: audit-ledger-service/Dockerfile
```audit-ledger-service/Dockerfile
FROM maven:3.9.6-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
RUN mvn clean install -pl common-library -am -DskipTests
RUN mvn clean package -pl audit-ledger-service -am -DskipTests

FROM eclipse-temurin:17-jre-jammy
WORKDIR /app
COPY --from=build /app/audit-ledger-service/target/*.jar app.jar
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### File: audit-ledger-service/pom.xml
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

    <artifactId>audit-ledger-service</artifactId>

    <dependencies>
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
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
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

### File: audit-ledger-service/src/main/resources/application.properties
```properties
server.port=8087
spring.application.name=audit-ledger-service
eureka.client.serviceUrl.defaultZone=http://localhost:8761/eureka/

# H2 Database Configuration
# NeonDB Database Configuration
spring.datasource.url=jdbc:postgresql://ep-cold-fog-a13rf1hh-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require&channelBinding=require
spring.datasource.username=neondb_owner
spring.datasource.password=npg_zie8fp2IGWkO
spring.datasource.driverClassName=org.postgresql.Driver
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.properties.hibernate.default_schema=audit_ledger
spring.jpa.hibernate.ddl-auto=update
spring.datasource.hikari.data-source-properties.ssl=true
spring.datasource.hikari.data-source-properties.sslmode=require

# Kafka Configuration
spring.kafka.bootstrap-servers=localhost:9092
spring.kafka.consumer.group-id=audit-group
spring.kafka.consumer.auto-offset-reset=earliest
spring.kafka.consumer.key-deserializer=org.apache.kafka.common.serialization.StringDeserializer
spring.kafka.consumer.value-deserializer=org.springframework.kafka.support.serializer.JsonDeserializer
spring.kafka.consumer.properties.spring.json.trusted.packages=com.carboncredit.common.event
```

### File: audit-ledger-service/src/main/java/com/carboncredit/auditservice/AuditServiceApplication.java
```java
package com.carboncredit.auditservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class AuditServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(AuditServiceApplication.class, args);
    }
}
```

### File: audit-ledger-service/src/main/java/com/carboncredit/auditservice/dao/AuditDAO.java
```java
package com.carboncredit.auditservice.dao;

import com.carboncredit.auditservice.model.AuditRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditDAO extends JpaRepository<AuditRecord, Long> {
    List<AuditRecord> findBySerialNumberOrderByTimestampAsc(String serialNumber);

    List<AuditRecord> findByEntityId(String entityId);

    List<AuditRecord> findByActorOrderByTimestampDesc(String actor);
}
```

### File: audit-ledger-service/src/main/java/com/carboncredit/auditservice/controller/AuditController.java
```java
package com.carboncredit.auditservice.controller;

import com.carboncredit.auditservice.dao.AuditDAO;
import com.carboncredit.auditservice.model.AuditRecord;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/audit")
@RequiredArgsConstructor
public class AuditController {

    private final AuditDAO auditDAO;

    @GetMapping("/chain-of-custody/{serialNumber}")
    public ResponseEntity<List<AuditRecord>> getChainOfCustody(@PathVariable String serialNumber) {
        List<AuditRecord> history = auditDAO.findBySerialNumberOrderByTimestampAsc(serialNumber);
        return ResponseEntity.ok(history);
    }

    @GetMapping("/organization/{actor}")
    public ResponseEntity<List<AuditRecord>> getOrganizationActivity(@PathVariable String actor) {
        return ResponseEntity.ok(auditDAO.findByActorOrderByTimestampDesc(actor));
    }

    // Note: A full chain of custody would also trace back to Verification and
    // Emission events using verificationId/reportId
    // For this MVP, we mainly track the credit's lifecycle by serial number.
    // Ideally, we would recursively fetch parent events.
}
```

### File: audit-ledger-service/src/main/java/com/carboncredit/auditservice/model/AuditRecord.java
```java
package com.carboncredit.auditservice.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_records", indexes = {
        @Index(name = "idx_serial_number", columnList = "serialNumber"),
        @Index(name = "idx_entity_id", columnList = "entityId")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String eventType; // EMISSION_REPORTED, VERIFICATION_COMPLETED, CREDIT_ISSUED, CREDIT_RETIRED

    private String entityId; // e.g., Report ID, Verification ID, Credit ID

    private String serialNumber; // The Credit Serial Number (if applicable)

    @Column(columnDefinition = "TEXT")
    private String details; // JSON payload details

    private String actor; // Organization ID or User ID

    private LocalDateTime timestamp;
}
```

### File: audit-ledger-service/src/main/java/com/carboncredit/auditservice/consumer/AuditConsumer.java
```java
package com.carboncredit.auditservice.consumer;

import com.carboncredit.auditservice.event.EmissionReportedEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class AuditConsumer {

    @KafkaListener(topics = "emission-topic", groupId = "audit-group")
    public void consumeEmissionEvent(EmissionReportedEvent event) {
        log.info("ALERTS: Audit Ledger received Emission Reported Event");
        log.info("Event ID: {}, Type: {}, Report ID: {}, Org ID: {}, Amount: {} {}",
                event.getEventId(), event.getEventType(), event.getReportId(),
                event.getOrganizationId(), event.getCarbonAmount(), event.getUnit());

        // In a real app, we would save this to a persistent Audit Log / Blockchain
        // ledger
    }
}
```

### File: audit-ledger-service/src/main/java/com/carboncredit/auditservice/consumer/AuditEventListener.java
```java
package com.carboncredit.auditservice.consumer;

import com.carboncredit.auditservice.dao.AuditDAO;
import com.carboncredit.auditservice.model.AuditRecord;
import com.carboncredit.common.event.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
@Slf4j
public class AuditEventListener {

    private final AuditDAO auditDAO;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "${kafka.topic.emission-reported:emission-topic}", groupId = "audit-service-group")
    public void handleEmissionReported(EmissionReportedEvent event) {
        saveAudit(event.getEventType(), event.getReportId().toString(), null, event,
                event.getOrganizationId().toString());
    }

    @KafkaListener(topics = "${kafka.topic.verification-completed:verification-completed-topic}", groupId = "audit-service-group")
    public void handleVerificationCompleted(VerificationCompletedEvent event) {
        saveAudit("VERIFICATION_COMPLETED", event.getVerificationId().toString(), null, event,
                event.getVerifierId().toString());
    }

    @KafkaListener(topics = "${kafka.topic.credit-issued:credit-issued-topic}", groupId = "audit-service-group")
    public void handleCreditIssued(CreditIssuedEvent event) {
        saveAudit(event.getEventType(), event.getCreditId().toString(), event.getSerialNumber(), event,
                event.getOrganizationId().toString());
    }

    @KafkaListener(topics = "${kafka.topic.credit-retired:credit-retired-topic}", groupId = "audit-service-group")
    public void handleCreditRetired(CreditRetiredEvent event) {
        saveAudit(event.getEventType(), event.getCreditId().toString(), event.getSerialNumber(), event,
                event.getOwnerId().toString());
    }

    @KafkaListener(topics = "${kafka.topic.trade-completed:trade-completed-topic}", groupId = "audit-service-group")
    public void handleTradeCompleted(com.carboncredit.common.event.TradeCompletedEvent event) {
        saveAudit("TRADE_COMPLETED", event.getCreditId().toString(), null, event,
                "Seller:" + event.getSellerId() + ">Buyer:" + event.getBuyerId());
    }

    @SuppressWarnings("null")
    private void saveAudit(String eventType, String entityId, String serialNumber, Object payload, String actor) {
        try {
            String details = objectMapper.writeValueAsString(payload);
            AuditRecord record = AuditRecord.builder()
                    .eventType(eventType)
                    .entityId(entityId)
                    .serialNumber(serialNumber)
                    .details(details)
                    .actor(actor)
                    .timestamp(LocalDateTime.now())
                    .build();
            auditDAO.save(record);
            log.info("Audited event: {} for entity: {}", eventType, entityId);
        } catch (Exception e) {
            log.error("Failed to save audit record", e);
        }
    }
}
```

### File: audit-ledger-service/src/main/java/com/carboncredit/auditservice/event/EmissionReportedEvent.java
```java
package com.carboncredit.auditservice.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class EmissionReportedEvent {
    private String eventId;
    private Long reportId;
    private Long projectId;
    private Long organizationId;
    private BigDecimal carbonAmount;
    private String unit;
    private String description;
    private String eventType;
}
```

