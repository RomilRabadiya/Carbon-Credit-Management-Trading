package com.carboncredit.creditservice.config;

import com.carboncredit.creditservice.event.CreditIssuanceFailedEvent;
import com.carboncredit.creditservice.event.CreditIssuedEvent;
import org.apache.kafka.clients.producer.ProducerConfig;
import org.apache.kafka.common.serialization.StringSerializer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.core.DefaultKafkaProducerFactory;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.kafka.core.ProducerFactory;
import org.springframework.kafka.support.serializer.JsonSerializer;

import java.util.HashMap;
import java.util.Map;

/**
 * Kafka Producer Configuration
 * 
 * Design Decisions:
 * - Idempotent producer (enable.idempotence=true)
 * - All replicas must acknowledge (acks=all)
 * - Retries enabled for resilience
 * - Separate templates for success and failure events
 */
@Configuration
public class KafkaProducerConfig {

    @Value("${spring.kafka.bootstrap-servers}")
    private String bootstrapServers;

    /**
     * Common producer configuration
     */
    private Map<String, Object> getProducerConfig() {
        Map<String, Object> config = new HashMap<>();

        config.put(ProducerConfig.BOOTSTRAP_SERVERS_CONFIG, bootstrapServers);
        config.put(ProducerConfig.KEY_SERIALIZER_CLASS_CONFIG, StringSerializer.class);
        config.put(ProducerConfig.VALUE_SERIALIZER_CLASS_CONFIG, JsonSerializer.class);

        // Idempotency and reliability
        config.put(ProducerConfig.ENABLE_IDEMPOTENCE_CONFIG, true);
        config.put(ProducerConfig.ACKS_CONFIG, "all");
        config.put(ProducerConfig.RETRIES_CONFIG, 3);
        config.put(ProducerConfig.MAX_IN_FLIGHT_REQUESTS_PER_CONNECTION, 5);

        return config;
    }

    /**
     * Producer Factory for CREDIT_ISSUED events
     */
    @Bean
    public ProducerFactory<String, CreditIssuedEvent> creditIssuedProducerFactory() {
        return new DefaultKafkaProducerFactory<>(getProducerConfig());
    }

    /**
     * KafkaTemplate for CREDIT_ISSUED events
     */
    @Bean
    public KafkaTemplate<String, CreditIssuedEvent> creditIssuedKafkaTemplate() {
        return new KafkaTemplate<>(creditIssuedProducerFactory());
    }

    /**
     * Producer Factory for CREDIT_ISSUANCE_FAILED events
     */
    @Bean
    public ProducerFactory<String, CreditIssuanceFailedEvent> creditFailureProducerFactory() {
        return new DefaultKafkaProducerFactory<>(getProducerConfig());
    }

    /**
     * KafkaTemplate for CREDIT_ISSUANCE_FAILED events
     */
    @Bean
    public KafkaTemplate<String, CreditIssuanceFailedEvent> creditFailureKafkaTemplate() {
        return new KafkaTemplate<>(creditFailureProducerFactory());
    }
}
