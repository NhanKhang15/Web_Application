package com.example.backend.auction.domain.auction;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface BidRepository extends JpaRepository<Bid, Integer> {
    List<Bid> findByAuction_AuctionIDOrderByBidTimeDesc(Integer auctionId);

    @org.springframework.data.jpa.repository.Query("SELECT new com.example.backend.auction.domain.auction.dto.BidHistoryDTO(b.bidder.username, b.bidAmount, b.bidTime) "
            +
            "FROM Bid b " +
            "WHERE b.auction.auctionID = :auctionId " +
            "ORDER BY b.bidAmount DESC")
    List<com.example.backend.auction.domain.auction.dto.BidHistoryDTO> findBidHistoryByAuctionId(Integer auctionId);
}
