package com.example.backend.auction.domain.auction.dto;

import java.math.BigDecimal;

public class EditAuctionRequest {
    private String title;
    private BigDecimal startingPrice;
    private BigDecimal minStep;
    private BigDecimal reservePrice;
    private BigDecimal buyNowPrice;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
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
}
