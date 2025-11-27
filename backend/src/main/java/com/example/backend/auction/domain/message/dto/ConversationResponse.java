package com.example.backend.auction.domain.message.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ConversationResponse {
    private Integer partnerId;   // ID người chat cùng
    private String partnerName;  // Tên người chat cùng
    private String lastMessage;  // Nội dung tin nhắn cuối
    private String timeAgo;      // Thời gian (đã format string hoặc để LocalDateTime tùy bạn)
    private LocalDateTime rawTime; // Dùng để sort nếu cần
}