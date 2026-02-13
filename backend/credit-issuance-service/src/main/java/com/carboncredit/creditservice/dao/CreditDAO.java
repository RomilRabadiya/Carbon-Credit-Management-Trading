package com.carboncredit.creditservice.dao;

import com.carboncredit.creditservice.model.CarbonCredit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CreditDAO extends JpaRepository<CarbonCredit, Long> {
    boolean existsByVerificationId(Long verificationId);

    Optional<CarbonCredit> findBySerialNumber(String serialNumber);

    java.util.List<CarbonCredit> findByStatus(String status);
}
