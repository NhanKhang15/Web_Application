package com.example.backend.auction.domain.auction.dto;

import com.example.backend.auction.domain.auction.Bid;

public class BidResult {
    private boolean success;
    private String message;
    private Bid bid;

    public BidResult(boolean success, String message, Bid bid) {
        this.success = success;
        this.message = message;
        this.bid = bid;
    }

    public static BidResult success(Bid bid) {
        return new BidResult(true, "Bid placed successfully", bid);
    }

    public static BidResult failed(String message) {
        return new BidResult(false, message, null);
    }

    public boolean isSuccess() {
        return success;
    }

    public String getMessage() {
        return message;
    }

    public Bid getBid() {
        return bid;
    }
}
