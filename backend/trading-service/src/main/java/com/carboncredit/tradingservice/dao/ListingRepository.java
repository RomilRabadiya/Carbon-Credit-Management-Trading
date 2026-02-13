package com.carboncredit.tradingservice.dao;

import com.carboncredit.tradingservice.model.Listing;
import com.carboncredit.tradingservice.model.ListingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ListingRepository extends JpaRepository<Listing, UUID> {
    List<Listing> findByStatus(ListingStatus status);

    List<Listing> findBySellerId(Long sellerId);

    // To prevent double listing
    boolean existsByCreditIdAndStatus(Long creditId, ListingStatus status);
}
