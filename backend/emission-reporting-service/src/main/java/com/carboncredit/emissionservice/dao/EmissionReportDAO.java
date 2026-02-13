package com.carboncredit.emissionservice.dao;

import com.carboncredit.emissionservice.model.EmissionReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmissionReportDAO extends JpaRepository<EmissionReport, Long> {
    boolean existsByProjectIdAndStatus(Long projectId, String status);

    // Check if a report exists for this project in PENDING or VERIFIED state (to
    // prevent spam)
    // For simplicity, we just check generic existence for now, or use a custom
    // query if needed
    // But JpaRepository allows multiple checks
    boolean existsByProjectIdAndStatusIn(Long projectId, java.util.Collection<String> statuses);
}
