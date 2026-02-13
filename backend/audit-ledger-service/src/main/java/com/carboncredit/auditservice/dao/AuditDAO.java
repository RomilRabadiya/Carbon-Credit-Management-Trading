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
