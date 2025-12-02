package com.example.backend.event;

import org.springframework.context.ApplicationEvent;

public class AuctionWonEvent extends ApplicationEvent {
    private final Integer auctionId;
    private final Integer winnerBidId;

    public AuctionWonEvent(Object source, Integer auctionId, Integer winnerBidId) {
        super(source);
        this.auctionId = auctionId;
        this.winnerBidId = winnerBidId;
    }

    public Integer getAuctionId() {
        return auctionId;
    }

    public Integer getWinnerBidId() {
        return winnerBidId;
    }
}
