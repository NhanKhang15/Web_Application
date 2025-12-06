package com.example.backend.chatbot.dto;

import java.util.List;

public class ChatRequest {
    private String message; // Tin nhắn hiện tại
    private List<HistoryItem> history; // Danh sách tin nhắn cũ
    private Integer userId;
    
    // Context cho việc đặt giá - lưu thông tin phiên đấu giá đang chờ xác nhận
    private PendingBid pendingBid;

    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }
    
    public PendingBid getPendingBid() { return pendingBid; }
    public void setPendingBid(PendingBid pendingBid) { this.pendingBid = pendingBid; }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public List<HistoryItem> getHistory() {
        return history;
    }

    public void setHistory(List<HistoryItem> history) {
        this.history = history;
    }
    
    // Class để lưu thông tin bid đang chờ xác nhận
    public static class PendingBid {
        private Integer auctionId;
        private String auctionSlug;
        private String auctionTitle;
        private Double bidAmount;
        private boolean awaitingConfirmation; // true = đang chờ user xác nhận
        
        public Integer getAuctionId() { return auctionId; }
        public void setAuctionId(Integer auctionId) { this.auctionId = auctionId; }
        
        public String getAuctionSlug() { return auctionSlug; }
        public void setAuctionSlug(String auctionSlug) { this.auctionSlug = auctionSlug; }
        
        public String getAuctionTitle() { return auctionTitle; }
        public void setAuctionTitle(String auctionTitle) { this.auctionTitle = auctionTitle; }
        
        public Double getBidAmount() { return bidAmount; }
        public void setBidAmount(Double bidAmount) { this.bidAmount = bidAmount; }
        
        public boolean isAwaitingConfirmation() { return awaitingConfirmation; }
        public void setAwaitingConfirmation(boolean awaitingConfirmation) { this.awaitingConfirmation = awaitingConfirmation; }
    }

    // Class con để hứng dữ liệu { text: "...", sender: "user/bot" } từ React
    public static class HistoryItem {
        private String text;
        private String sender; // "user" hoặc "bot"

        public String getText() { return text; }
        public void setText(String text) { this.text = text; }

        public String getSender() { return sender; }
        public void setSender(String sender) { this.sender = sender; }
    }
}
