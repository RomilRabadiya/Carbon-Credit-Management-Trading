package com.carbon.audit.repository;

import com.carbon.audit.entity.LedgerEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LedgerEntryRepository extends JpaRepository<LedgerEntry, Long> {
    List<LedgerEntry> findByOrganizationIdOrderByEntryDateDesc(Long organizationId);
}
