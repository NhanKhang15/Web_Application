package com.example.backend.auction.domain.auction.dto;

import java.math.BigDecimal;

public interface ActiveAuctionDto {
    Integer getAuctionId();

    Integer getItemId();

    BigDecimal getCurrentPrice();

    BigDecimal getBuyNowPrice();

    String getTitle();

    String getThumbnail();

    String getSellerName();

    String getSlug();

    Integer getCategoryId();

    String getCategoryName();
}