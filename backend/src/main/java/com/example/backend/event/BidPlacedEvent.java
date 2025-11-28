package com.example.backend.event;

import org.springframework.context.ApplicationEvent;

public class BidPlacedEvent extends ApplicationEvent {
    private final Integer bidId;

    public BidPlacedEvent(Object source, Integer bidId) {
        super(source);
        this.bidId = bidId;
    }

    public Integer getBidId() {
        return bidId;
    }
}
