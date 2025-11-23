package com.example.backend.auction.domain.auction.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public interface AuctionDto {
    Integer getAuctionId();

    Integer getItemId();

    BigDecimal getCurrentPrice();

    BigDecimal getBuyNowPrice();

    String getTitle();

    String getThumbnail();

    String getSellerName();

    String getSlug();

    BigDecimal getStartingPrice();

    LocalDateTime getStartDate(); 
     
    LocalDateTime getEndDate(); 
      
    String getStatus(); 
             
    Integer getCategoryId();

    
    String getCategoryName();

    
    String getLocation();

}