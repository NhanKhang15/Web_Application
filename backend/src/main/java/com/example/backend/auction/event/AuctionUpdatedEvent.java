package com.example.backend.auction.event;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class AuctionUpdatedEvent {
    private Integer auctionId;
    private BigDecimal currentPrice;
    private Integer highestBidderId;
    private String highestBidderName;
    private LocalDateTime updateTime;

    public AuctionUpdatedEvent(Integer auctionId, BigDecimal currentPrice, Integer highestBidderId,
            String highestBidderName) {
        this.auctionId = auctionId;
        this.currentPrice = currentPrice;
        this.highestBidderId = highestBidderId;
        this.highestBidderName = highestBidderName;
        this.updateTime = LocalDateTime.now();
    }

    public Integer getAuctionId() {
        return auctionId;
    }

    public BigDecimal getCurrentPrice() {
        return currentPrice;
    }

    public Integer getHighestBidderId() {
        return highestBidderId;
    }

    public String getHighestBidderName() {
        return highestBidderName;
    }

    public LocalDateTime getUpdateTime() {
        return updateTime;
    }
}
