package com.carbon.audit.repository;

import com.carbon.audit.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findBySourceOrganizationIdOrDestinationOrganizationIdOrderByTimestampDesc(Long sourceId, Long destinationId);
    List<AuditLog> findByTransactionTypeOrderByTimestampDesc(String transactionType);
}
