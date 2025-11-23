package com.example.backend.auction.domain.auction.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record AuctionDetailDto(
        Integer auctionId,
        Integer itemId,
        Integer sellerId,
        String categoryName,
        String title,
        String slug,
        String description,
        String location,
        BigDecimal startingPrice,
        BigDecimal minStep,
        BigDecimal currentPrice,
        BigDecimal reservePrice,
        BigDecimal buyNowPrice,
        String status,
        LocalDateTime startDate,
        LocalDateTime endDate,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        String sellerName,
        List<String> images) {
}
