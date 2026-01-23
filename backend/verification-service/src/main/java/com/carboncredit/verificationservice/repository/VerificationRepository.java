package com.carboncredit.verificationservice.repository;

import com.carboncredit.verificationservice.model.VerificationRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VerificationRepository extends JpaRepository<VerificationRequest, Long> {

    List<VerificationRequest> findByOrganizationId(Long organizationId);

    Optional<VerificationRequest> findByReportId(Long reportId);

    List<VerificationRequest> findByStatus(String status);
}
