package com.example.backend.auction_items.auction;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "Auctions")
public class Auction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "AuctionID")
    private Integer auctionId;

    @Column(name = "ItemID", nullable = false)
    private Integer itemId;

    @Column(name = "StartingPrice", nullable = false, precision = 18, scale = 2)
    private BigDecimal startingPrice;

    @Column(name = "MinStep", nullable = false, precision = 18, scale = 2)
    private BigDecimal minStep;

    @Column(name = "CurrentPrice", nullable = false, precision = 18, scale = 2)
    private BigDecimal currentPrice = BigDecimal.ZERO;

    @Column(name = "ReservePrice", precision = 18, scale = 2)
    private BigDecimal reservePrice;

    @Column(name = "BuyNowPrice", precision = 18, scale = 2)
    private BigDecimal buyNowPrice;

    @Enumerated(EnumType.STRING)
    @Column(name = "Status", nullable = false)
    private AuctionStatus status = AuctionStatus.Scheduled;

    @Column(name = "StartDate", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "EndDate", nullable = false)
    private LocalDateTime endDate;

    @Column(name = "CreatedAt", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "UpdatedAt", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (updatedAt == null) updatedAt = LocalDateTime.now();
        if (currentPrice == null) currentPrice = startingPrice;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

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

    public AuctionStatus getStatus() { return status; }
    public void setStatus(AuctionStatus status) { this.status = status; }

    public LocalDateTime getStartDate() { return startDate; }
    public void setStartDate(LocalDateTime startDate) { this.startDate = startDate; }

    public LocalDateTime getEndDate() { return endDate; }
    public void setEndDate(LocalDateTime endDate) { this.endDate = endDate; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }

    public enum AuctionStatus {
        Draft, Scheduled, Open, Ended, Closed, Cancelled
    }
}