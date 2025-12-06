package com.example.backend.auction.domain.auction.dto;

public class AuctionEndedMessage {
    private String type;
    private Integer winnerBidId;

    public AuctionEndedMessage() {
    }

    public AuctionEndedMessage(String type, Integer winnerBidId) {
        this.type = type;
        this.winnerBidId = winnerBidId;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Integer getWinnerBidId() {
        return winnerBidId;
    }

    public void setWinnerBidId(Integer winnerBidId) {
        this.winnerBidId = winnerBidId;
    }
}
