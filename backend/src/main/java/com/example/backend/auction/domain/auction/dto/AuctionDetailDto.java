package com.example.backend.auction.domain.auction.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record AuctionDetailDto(
        // --- Thông tin từ AuctionItems ---
        Integer itemId,
        Integer sellerId,
        String categoryName,
        Integer categoryId,
        String title,
        String slug,
        String description,
        String location,

        // --- Thông tin từ Auctions ---
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

        // --- Danh sách tất cả ảnh ---
        List<String> imageUrls) {
}