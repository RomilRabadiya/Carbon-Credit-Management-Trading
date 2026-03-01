package com.carbon.trade.dao;

import com.carbon.trade.model.Listing;
import com.carbon.trade.model.ListingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ListingRepository extends JpaRepository<Listing, Long> {
    List<Listing> findByStatus(ListingStatus status);

    List<Listing> findBySellerId(Long sellerId);

    // To prevent double listing
    boolean existsByCreditIdAndStatus(Long creditId, ListingStatus status);
}
