package com.example.backend.event;

import java.util.List;
import org.springframework.context.ApplicationEvent;

public class RefundLosersEvent extends ApplicationEvent {
    private final Integer auctionId;
    private final List<Integer> loserBidIds; // List of loser Bid IDs

    public RefundLosersEvent(Object source, Integer auctionId, List<Integer> loserBidIds) {
        super(source);
        this.auctionId = auctionId;
        this.loserBidIds = loserBidIds;
    }

    public Integer getAuctionId() {
        return auctionId;
    }

    public List<Integer> getLoserBidIds() {
        return loserBidIds;
    }
}
