package com.example.backend.auction.domain.auction.dto;

import java.time.LocalDateTime;

/**
 * DTO for similar auction items displayed in auction detail page.
 * Contains minimal fields needed for UI display.
 */
public interface SimilarItemDto {
    Integer getItemId();

    String getTitle();

    String getSlug();

    String getThumbnail();

    LocalDateTime getCreatedAt();
}
