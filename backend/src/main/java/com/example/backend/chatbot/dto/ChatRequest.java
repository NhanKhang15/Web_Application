package com.example.backend.chatbot.dto;

import java.util.List;

public class ChatRequest {
    private String message; // Tin nhắn hiện tại
    private List<HistoryItem> history; // Danh sách tin nhắn cũ
    private Integer userId;

    public Integer getUserId() { return userId; }
    public void setUserId(Integer userId) { this.userId = userId; }

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