package com.example.backend.auction.domain.auction.dto;

import java.math.BigDecimal;

public class PlaceBidRequest {
    private Integer auctionId;
    private BigDecimal amount;

    public Integer getAuctionId() {
        return auctionId;
    }

    public void setAuctionId(Integer auctionId) {
        this.auctionId = auctionId;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }
}
