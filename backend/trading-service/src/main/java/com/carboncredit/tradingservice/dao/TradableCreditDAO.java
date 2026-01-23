package com.carboncredit.tradingservice.dao;

import com.carboncredit.tradingservice.model.TradableCredit;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TradableCreditDAO extends JpaRepository<TradableCredit, Long> {

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT t FROM TradableCredit t WHERE t.id = :id")
    Optional<TradableCredit> findByIdForUpdate(Long id);

    Optional<TradableCredit> findBySerialNumber(String serialNumber);
}
