package com.carbon.core.emission.repository;

import com.carbon.core.emission.model.EmissionReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Collection;

@Repository
public interface EmissionReportRepository extends JpaRepository<EmissionReport, Long> {
    boolean existsByProjectIdAndStatus(Long projectId, String status);
    boolean existsByProjectIdAndStatusIn(Long projectId, Collection<String> statuses);
}
