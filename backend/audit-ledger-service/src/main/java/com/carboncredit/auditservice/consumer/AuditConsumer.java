package com.carboncredit.auditservice.consumer;

import com.carboncredit.common.event.EmissionReportedEvent;
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
