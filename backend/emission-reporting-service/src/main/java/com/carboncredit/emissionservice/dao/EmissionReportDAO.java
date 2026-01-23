package com.carboncredit.emissionservice.dao;

import com.carboncredit.emissionservice.model.EmissionReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EmissionReportDAO extends JpaRepository<EmissionReport, Long> {
}
