package com.example.backend.event;

import org.springframework.context.ApplicationEvent;
import java.util.List;

public class AuctionCancelledEvent extends ApplicationEvent {
    private final Integer auctionId;
    private final List<Integer> allBidIds;

    public AuctionCancelledEvent(Object source, Integer auctionId, List<Integer> allBidIds) {
        super(source);
        this.auctionId = auctionId;
        this.allBidIds = allBidIds;
    }

    public Integer getAuctionId() {
        return auctionId;
    }

    public List<Integer> getAllBidIds() {
        return allBidIds;
    }
}
