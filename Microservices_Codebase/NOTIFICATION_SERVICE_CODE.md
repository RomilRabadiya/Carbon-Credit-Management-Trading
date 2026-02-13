### File: notification-service/pom.xml
```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>com.carboncredit</groupId>
        <artifactId>backend</artifactId>
        <version>0.0.1-SNAPSHOT</version>
    </parent>

    <artifactId>notification-service</artifactId>
    <name>notification-service</name>
    <description>Notification Service for Carbon Credit System</description>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-websocket</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.kafka</groupId>
            <artifactId>spring-kafka</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.cloud</groupId>
            <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
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
            <groupId>org.springframework.kafka</groupId>
            <artifactId>spring-kafka-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>com.carboncredit</groupId>
            <artifactId>common-library</artifactId>
            <version>0.0.1-SNAPSHOT</version>
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
        </plugins>
    </build>
</project>
```

### File: notification-service/src/main/resources/application.properties
```properties
server.port=8088
spring.application.name=notification-service
eureka.client.serviceUrl.defaultZone=http://localhost:8761/eureka/

# Kafka Configuration
spring.kafka.bootstrap-servers=localhost:9092
spring.kafka.consumer.group-id=notification-service-group
spring.kafka.consumer.auto-offset-reset=earliest
spring.kafka.consumer.key-deserializer=org.apache.kafka.common.serialization.StringDeserializer
spring.kafka.consumer.value-deserializer=org.springframework.kafka.support.serializer.JsonDeserializer
spring.kafka.consumer.properties.spring.json.trusted.packages=*

# Logging
logging.level.org.springframework.web.socket=INFO
logging.level.com.carboncredit=DEBUG
```

### File: notification-service/src/main/java/com/carboncredit/notificationservice/listener/NotificationEventListener.java
```java
package com.carboncredit.notificationservice.listener;

import com.carboncredit.notificationservice.event.CreditIssuedEvent;
import com.carboncredit.notificationservice.event.EmissionReportedEvent;
import com.carboncredit.notificationservice.event.VerificationCompletedEvent;
import com.carboncredit.notificationservice.service.NotificationMessagingService;

import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
public class NotificationEventListener {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(NotificationEventListener.class);

    private final NotificationMessagingService messagingService;

    public NotificationEventListener(NotificationMessagingService messagingService) {
        this.messagingService = messagingService;
    }

    @KafkaListener(topics = "emission-topic", groupId = "notification-service-group")
    public void handleEmissionReported(EmissionReportedEvent event) {
        log.info("Received EmissionReportedEvent: {}", event);
        // Push to public topic or specific user
        messagingService.sendNotification("/topic/emissions", event);
    }

    @KafkaListener(topics = "EMISSION_VERIFIED", groupId = "notification-service-group")
    public void handleVerificationCompleted(VerificationCompletedEvent event) {
        log.info("Received VerificationCompletedEvent: {}", event);
        messagingService.sendNotification("/topic/verifications", event);
    }

    @KafkaListener(topics = "credit-issued-topic", groupId = "notification-service-group")
    public void handleCreditIssued(CreditIssuedEvent event) {
        log.info("Received CreditIssuedEvent: {}", event);
        messagingService.sendNotification("/topic/credits", event);
    }
}
```

### File: notification-service/src/main/java/com/carboncredit/notificationservice/config/KafkaConsumerConfig.java
```java
package com.carboncredit.notificationservice.config;

import org.apache.kafka.clients.consumer.ConsumerConfig;
import org.apache.kafka.common.serialization.StringDeserializer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.kafka.config.ConcurrentKafkaListenerContainerFactory;
import org.springframework.kafka.core.ConsumerFactory;
import org.springframework.kafka.core.DefaultKafkaConsumerFactory;

import org.springframework.kafka.support.serializer.JsonDeserializer;

import java.util.Map;

@EnableKafka
@Configuration
public class KafkaConsumerConfig {

    @Bean
    @SuppressWarnings("null")
    public ConsumerFactory<String, Object> consumerFactory() {
        JsonDeserializer<Object> deserializer = new JsonDeserializer<>(Object.class);
        // CRITICAL: Ignore the type headers sent by the producer (which point to
        // common-library classes)
        // This allows us to map the JSON to our LOCAL duplicated classes.
        deserializer.setRemoveTypeHeaders(false);
        deserializer.addTrustedPackages("*");
        deserializer.setUseTypeMapperForKey(true);

        return new DefaultKafkaConsumerFactory<>(
                Map.of(
                        ConsumerConfig.BOOTSTRAP_SERVERS_CONFIG, "localhost:9092",
                        ConsumerConfig.GROUP_ID_CONFIG, "notification-service-group",
                        ConsumerConfig.KEY_DESERIALIZER_CLASS_CONFIG, StringDeserializer.class),
                new StringDeserializer(),
                deserializer);
    }

    @Bean
    public ConcurrentKafkaListenerContainerFactory<String, Object> kafkaListenerContainerFactory() {
        ConcurrentKafkaListenerContainerFactory<String, Object> factory = new ConcurrentKafkaListenerContainerFactory<>();
        factory.setConsumerFactory(consumerFactory());
        return factory;
    }
}
```

### File: notification-service/src/main/java/com/carboncredit/notificationservice/config/WebSocketConfig.java
```java
package com.carboncredit.notificationservice.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void configureMessageBroker(@NonNull MessageBrokerRegistry config) {
        // Enable a simple memory-based message broker to carry the messages back to the
        // client on destinations prefixed with "/topic"
        config.enableSimpleBroker("/topic");
        // Defines the prefix for messages that are bound for @MessageMapping methods
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(@NonNull StompEndpointRegistry registry) {
        // Registers the "/ws" endpoint, enabling SockJS fallback options so that
        // alternate transports can be used if WebSocket is not available.
        // The SockJS client will attempt to connect to "/ws" and use the best available
        // transport (websocket, xhr-streaming, xhr-polling, etc)
        registry.addEndpoint("/ws")
                .setAllowedOriginPatterns("*") // Allow all origins for dev
                .withSockJS();
    }
}
```

### File: notification-service/src/main/java/com/carboncredit/notificationservice/NotificationServiceApplication.java
```java
package com.carboncredit.notificationservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class NotificationServiceApplication {
    public static void main(String[] args) {
        SpringApplication.run(NotificationServiceApplication.class, args);
    }
}
```

### File: notification-service/src/main/java/com/carboncredit/notificationservice/service/NotificationMessagingService.java
```java
package com.carboncredit.notificationservice.service;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class NotificationMessagingService {

    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(NotificationMessagingService.class);

    private final SimpMessagingTemplate messagingTemplate;

    public NotificationMessagingService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @SuppressWarnings("null")
    public void sendNotification(String destination, Object payload) {
        log.info("Sending notification to {}: {}", destination, payload);
        messagingTemplate.convertAndSend(destination, payload);
    }
}
```

### File: notification-service/src/main/java/com/carboncredit/notificationservice/event/VerificationCompletedEvent.java
```java
package com.carboncredit.notificationservice.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VerificationCompletedEvent {
    private Long verificationId;
    private Long reportId;
    private Long projectId;
    private Long organizationId;
    private String status;
    private BigDecimal carbonCreditsCalculated;
    private String remarks;
    private String eventType; // "VERIFICATION_COMPLETED"
}
```

### File: notification-service/src/main/java/com/carboncredit/notificationservice/event/CreditIssuedEvent.java
```java
package com.carboncredit.notificationservice.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreditIssuedEvent {
    private Long creditId;
    private Long projectId;
    private BigDecimal amount;
    private Long ownerId;
    private String eventType; // "CREDIT_ISSUED"
}
```

### File: notification-service/src/main/java/com/carboncredit/notificationservice/event/EmissionReportedEvent.java
```java
package com.carboncredit.notificationservice.event;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmissionReportedEvent {
    private Long reportId;
    private Long projectId;
    private Long organizationId;
    private BigDecimal carbonAmount;
    private String unit;
    private String description;
    private String eventType; // "EMISSION_REPORTED"
}
```

