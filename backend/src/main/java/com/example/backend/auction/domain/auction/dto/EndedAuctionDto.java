package com.example.backend.auction.domain.auction.dto;

import java.time.LocalDateTime;

// Dùng Interface để hứng dữ liệu từ Native Query (Hiệu năng cao nhất)
public interface EndedAuctionDto {
    Integer getAuctionId();

    String getTitle();

    Double getFinalPrice(); // Final Price (CurrentPrice)

    String getStatus();

    String getWinnerName(); // Winner

    LocalDateTime getEndDate(); // Time
}
