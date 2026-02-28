package com.carbon.core.credit.dao;

import com.carbon.core.credit.model.CarbonCredit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CreditDAO extends JpaRepository<CarbonCredit, Long> {
    boolean existsByVerificationId(Long verificationId);

    Optional<CarbonCredit> findBySerialNumber(String serialNumber);

    java.util.List<CarbonCredit> findByStatus(String status);

    java.util.List<CarbonCredit> findByOwnerId(Long ownerId);
}
