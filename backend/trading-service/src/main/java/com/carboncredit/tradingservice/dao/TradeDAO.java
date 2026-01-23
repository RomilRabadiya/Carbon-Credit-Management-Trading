package com.carboncredit.tradingservice.dao;

import com.carboncredit.tradingservice.model.Trade;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TradeDAO extends JpaRepository<Trade, Long> {
    List<Trade> findBySellerId(Long sellerId);

    List<Trade> findByBuyerId(Long buyerId);

    List<Trade> findByCreditId(Long creditId);
}
