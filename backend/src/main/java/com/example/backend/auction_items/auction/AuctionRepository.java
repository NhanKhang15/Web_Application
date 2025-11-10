package com.example.backend.auction_items.auction;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AuctionRepository extends JpaRepository<Auction, Integer> {
    // Thêm phương thức này để getAuctionByItemId hoạt động
    Optional<Auction> findByItemId(Integer itemId);
}