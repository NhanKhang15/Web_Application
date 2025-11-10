package com.example.backend.auction_items.auction;

import java.math.BigDecimal;
import java.time.LocalDateTime;

// DTO này đại diện cho dữ liệu Auction trả về
public class AuctionDto {

    private Integer auctionId;
    private Integer itemId;
    private BigDecimal startingPrice;
    private BigDecimal minStep;
    private BigDecimal currentPrice;
    private BigDecimal reservePrice;
    private BigDecimal buyNowPrice;
    private String status;
    private LocalDateTime startDate;
    private LocalDateTime endDate;

    // Getters and Setters
    public Integer getAuctionId() { return auctionId; }
    public void setAuctionId(Integer auctionId) { this.auctionId = auctionId; }

    public Integer getItemId() { return itemId; }
    public void setItemId(Integer itemId) { this.itemId = itemId; }

    public BigDecimal getStartingPrice() { return startingPrice; }
    public void setStartingPrice(BigDecimal startingPrice) { this.startingPrice = startingPrice; }

    public BigDecimal getMinStep() { return minStep; }
    public void setMinStep(BigDecimal minStep) { this.minStep = minStep; }

    public BigDecimal getCurrentPrice() { return currentPrice; }
    public void setCurrentPrice(BigDecimal currentPrice) { this.currentPrice = currentPrice; }

    public BigDecimal getReservePrice() { return reservePrice; }
    public void setReservePrice(BigDecimal reservePrice) { this.reservePrice = reservePrice; }

    public BigDecimal getBuyNowPrice() { return buyNowPrice; }
    public void setBuyNowPrice(BigDecimal buyNowPrice) { this.buyNowPrice = buyNowPrice; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }

    public LocalDateTime getEndDate() { return endDate; }
    public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }
}