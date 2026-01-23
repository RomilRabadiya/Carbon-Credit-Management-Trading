package com.carboncredit.creditservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.kafka.annotation.EnableKafka;
import org.springframework.transaction.annotation.EnableTransactionManagement;

/**
 * Main Application Class for Credit Issuance Service
 * 
 * Service Registration:
 * - Registers with Eureka as "CREDIT-SERVICE"
 * - Loads configuration from Spring Cloud Config Server
 * - Enables Kafka for event-driven architecture
 * 
 * Architecture:
 * - Microservice pattern with service discovery
 * - Event-driven credit issuance via Kafka
 * - PostgreSQL for persistent storage
 * - RESTful read-only API endpoints
 */
@SpringBootApplication
@EnableDiscoveryClient // Eureka client
@EnableKafka // Kafka support
@EnableJpaRepositories // JPA repositories
@EnableTransactionManagement // Transaction support
public class CreditServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(CreditServiceApplication.class, args);
    }
}
