package com.example.backend.auction.domain.auction.dto;

import java.time.LocalDateTime;

public interface ScheduledAuctionDto {
    Integer getAuctionId();

    String getTitle();

    Double getMinStep(); // Min Inc

    String getSellerName(); // Trader

    Double getStartingPrice(); // Base Price

    Double getBuyNowPrice();

    LocalDateTime getStartDate(); // Timer
}
