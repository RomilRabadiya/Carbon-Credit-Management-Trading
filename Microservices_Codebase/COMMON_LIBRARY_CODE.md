### File: common-library/pom.xml
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

    <artifactId>common-library</artifactId>

    <dependencies>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        <dependency>
            <groupId>org.springframework.kafka</groupId>
            <artifactId>spring-kafka</artifactId>
        </dependency>
        <dependency>
            <groupId>com.fasterxml.jackson.core</groupId>
            <artifactId>jackson-databind</artifactId>
        </dependency>
        <!-- Distributed Tracing -->
        <dependency>
            <groupId>io.micrometer</groupId>
            <artifactId>micrometer-tracing-bridge-brave</artifactId>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <skip>true</skip>
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

### File: common-library/src/main/java/com/carboncredit/common/dto/ResponseEnvelope.java
```java
package com.carboncredit.common.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class ResponseEnvelope<T> {

    private LocalDateTime timestamp = LocalDateTime.now();

    private int status;
    private boolean success;
    private String message;
    private T data;
    private String error;

    public ResponseEnvelope() {
    }

    public ResponseEnvelope(LocalDateTime timestamp, int status, boolean success, String message, T data,
            String error) {
        this.timestamp = timestamp;
        this.status = status;
        this.success = success;
        this.message = message;
        this.data = data;
        this.error = error;
    }

    public static <T> ResponseEnvelopeBuilder<T> builder() {
        return new ResponseEnvelopeBuilder<>();
    }

    public static class ResponseEnvelopeBuilder<T> {
        private LocalDateTime timestamp = LocalDateTime.now();
        private int status;
        private boolean success;
        private String message;
        private T data;
        private String error;

        public ResponseEnvelopeBuilder<T> status(int status) {
            this.status = status;
            return this;
        }

        public ResponseEnvelopeBuilder<T> success(boolean success) {
            this.success = success;
            return this;
        }

        public ResponseEnvelopeBuilder<T> message(String message) {
            this.message = message;
            return this;
        }

        public ResponseEnvelopeBuilder<T> data(T data) {
            this.data = data;
            return this;
        }

        public ResponseEnvelopeBuilder<T> error(String error) {
            this.error = error;
            return this;
        }

        public ResponseEnvelope<T> build() {
            return new ResponseEnvelope<T>(timestamp, status, success, message, data, error);
        }
    }

    public static <T> ResponseEnvelope<T> success(T data, String message) {
        return ResponseEnvelope.<T>builder()
                .status(200)
                .success(true)
                .message(message)
                .data(data)
                .build();
    }

    public static <T> ResponseEnvelope<T> error(String errorMessage, int status) {
        return ResponseEnvelope.<T>builder()
                .status(status)
                .success(false)
                .error(errorMessage)
                .build();
    }
}
```

### File: common-library/src/main/java/com/carboncredit/common/event/CreditRetiredEvent.java
```java
package com.carboncredit.common.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class CreditRetiredEvent extends BaseEvent {
    private Long creditId;
    private String serialNumber;
    private Long ownerId;
    private String reason;
    private Long transactionId;
}
```

### File: common-library/src/main/java/com/carboncredit/common/event/VerificationCompletedEvent.java
```java
package com.carboncredit.common.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class VerificationCompletedEvent extends BaseEvent {
    private Long verificationId;
    private Long reportId;
    private Long projectId;
    private Long organizationId;
    private Long verifierId;
    private String status; // APPROVED, REJECTED
    private BigDecimal carbonCreditsCalculated;
    private String remarks;
}
```

### File: common-library/src/main/java/com/carboncredit/common/event/CreditIssuedEvent.java
```java
package com.carboncredit.common.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class CreditIssuedEvent extends BaseEvent {
    private Long creditId;
    private String serialNumber;
    private Long organizationId;
    private Long verificationId;
    private BigDecimal creditAmount;
    private String unit;
}
```

### File: common-library/src/main/java/com/carboncredit/common/event/BaseEvent.java
```java
package com.carboncredit.common.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public abstract class BaseEvent {
    private String eventId = UUID.randomUUID().toString();
    private LocalDateTime timestamp = LocalDateTime.now();
    private String eventType;
}
```

### File: common-library/src/main/java/com/carboncredit/common/event/TradeExecutedEvent.java
```java
package com.carboncredit.common.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class TradeExecutedEvent extends BaseEvent {
    private Long tradeId;
    private Long buyerOrgId;
    private Long sellerOrgId;
    private BigDecimal creditAmount;
    private BigDecimal pricePerCredit;
    private BigDecimal totalPrice;
}
```

### File: common-library/src/main/java/com/carboncredit/common/event/TradeCompletedEvent.java
```java
package com.carboncredit.common.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TradeCompletedEvent {
    private UUID listingId;
    private Long buyerId;
    private Long sellerId;
    private Long creditId;
    private BigDecimal pricePerUnit;
    private LocalDateTime timestamp;
    private String eventType; // "TRADE_COMPLETED"
}
```

### File: common-library/src/main/java/com/carboncredit/common/event/EmissionReportedEvent.java
```java
package com.carboncredit.common.event;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Data
@EqualsAndHashCode(callSuper = true)
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public class EmissionReportedEvent extends BaseEvent {
    private Long reportId;
    private Long projectId;
    private Long organizationId;
    private BigDecimal carbonAmount;
    private String unit;
    private String description;
}
```

