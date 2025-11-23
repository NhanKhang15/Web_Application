package com.example.backend.auction.domain.auction.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public interface AuctionDetailProjection {
    Integer getAuctionId();
    // Item info
    Integer getItemId();

    Integer getSellerId();

    String getCategoryName();

    Integer getCategoryId();

    String getTitle();

    String getSlug();

    String getDescription();

    String getLocation();

    String getThumbnail();

    // Auction info
    BigDecimal getStartingPrice();

    BigDecimal getMinStep();

    BigDecimal getCurrentPrice();

    BigDecimal getReservePrice();

    BigDecimal getBuyNowPrice();

    String getStatus();

    LocalDateTime getStartDate();

    LocalDateTime getEndDate();

    LocalDateTime getCreatedAt();

    LocalDateTime getUpdatedAt();

    // User info
    String getSellerName();
}