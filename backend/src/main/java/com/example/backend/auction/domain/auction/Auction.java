package com.example.backend.auction.domain.auction;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.example.backend.auction.domain.item.AuctionItems;
import com.example.backend.auction.domain.item.AuctionStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "Auctions")
public class Auction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "AuctionID")
    private Integer auctionID;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ItemID", nullable = false)
    private AuctionItems item;

    @Enumerated(EnumType.STRING)
    @Column(name = "Status", nullable = false)
    private AuctionStatus status = AuctionStatus.Scheduled;

    @Column(name = "StartingPrice", nullable = false, precision = 18, scale = 2)
    private BigDecimal startingPrice;

    @Column(name = "MinStep", nullable = false, precision = 18, scale = 2)
    private BigDecimal minStep;

    @Column(name = "CurrentPrice", nullable = false, precision = 18, scale = 2)
    private BigDecimal currentPrice;

    @Column(name = "ReservePrice", precision = 18, scale = 2)
    private BigDecimal reservePrice;

    @Column(name = "BuyNowPrice", precision = 18, scale = 2)
    private BigDecimal buyNowPrice;

    @Column(name = "StartDate", nullable = false)
    private LocalDateTime startDate;

    @Column(name = "EndDate", nullable = false)
    private LocalDateTime endDate;

    @Column(name = "CurrentHighestBidId")
    private Integer currentHighestBidId;

    // getters/setters
    public Integer getCurrentHighestBidId() {
        return currentHighestBidId;
    }

    public void setCurrentHighestBidId(Integer currentHighestBidId) {
        this.currentHighestBidId = currentHighestBidId;
    }

    public Integer getAuctionID() {
        return auctionID;
    }

    public AuctionItems getItem() {
        return item;
    }

    public void setItem(AuctionItems item) {
        this.item = item;
    }

    public AuctionStatus getStatus() {
        return status;
    }

    public void setStatus(AuctionStatus status) {
        this.status = status;
    }

    public BigDecimal getStartingPrice() {
        return startingPrice;
    }

    public void setStartingPrice(BigDecimal startingPrice) {
        this.startingPrice = startingPrice;
    }

    public BigDecimal getMinStep() {
        return minStep;
    }

    public void setMinStep(BigDecimal minStep) {
        this.minStep = minStep;
    }

    public BigDecimal getCurrentPrice() {
        return currentPrice;
    }

    public void setCurrentPrice(BigDecimal currentPrice) {
        this.currentPrice = currentPrice;
    }

    public BigDecimal getReservePrice() {
        return reservePrice;
    }

    public void setReservePrice(BigDecimal reservePrice) {
        this.reservePrice = reservePrice;
    }

    public BigDecimal getBuyNowPrice() {
        return buyNowPrice;
    }

    public void setBuyNowPrice(BigDecimal buyNowPrice) {
        this.buyNowPrice = buyNowPrice;
    }

    public LocalDateTime getStartDate() {
        return startDate;
    }

    public void setStartDate(LocalDateTime startDate) {
        this.startDate = startDate;
    }

    public LocalDateTime getEndDate() {
        return endDate;
    }

    public void setEndDate(LocalDateTime endDate) {
        this.endDate = endDate;
    }
}
