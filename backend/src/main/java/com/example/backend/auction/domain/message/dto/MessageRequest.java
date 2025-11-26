package com.example.backend.auction.domain.message.dto;

import lombok.Data;

@Data
public class MessageRequest {
    private Integer receiverId;
    private Integer auctionId;
    private String content;
}