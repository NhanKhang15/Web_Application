package com.example.backend.chatbot.controller;

import com.example.backend.chatbot.dto.ChatRequest;
import com.example.backend.chatbot.dto.ChatResponse;
import com.example.backend.chatbot.service.ChatbotService;
import com.example.backend.chatbot.service.RateLimitingService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/chatbot")
public class ChatController {

    @Autowired
    private ChatbotService chatbotService;

    @Autowired
    private RateLimitingService rateLimitingService;

    @PostMapping("/message")
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        String userId = request.getUserId() != null ? request.getUserId().toString() : "anonymous";

        // Log incoming request
        log.info("Chat request from user: {}, message length: {}",
                userId,
                request.getMessage() != null ? request.getMessage().length() : 0);

        // Debug: Log pendingBid from request
        if (request.getPendingBid() != null) {
            log.info("Received pendingBid from frontend: auctionId={}, amount={}, awaitingConfirmation={}",
                    request.getPendingBid().getAuctionId(),
                    request.getPendingBid().getBidAmount(),
                    request.getPendingBid().isAwaitingConfirmation());
        } else {
            log.info("No pendingBid in request from frontend");
        }

        // Check rate limit
        if (!rateLimitingService.tryConsume(userId)) {
            log.warn("Rate limit exceeded for user: {}", userId);
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(new ChatResponse("⚠️ Bạn đang gửi quá nhiều tin nhắn. Vui lòng đợi một phút rồi thử lại."));
        }

        try {
            long startTime = System.currentTimeMillis();

            // Process message
            String response = chatbotService.processUserMessage(request);

            long duration = System.currentTimeMillis() - startTime;
            log.info("Chat response for user: {} completed in {}ms, response length: {}",
                    userId, duration, response.length());

            return ResponseEntity.ok(new ChatResponse(response));

        } catch (Exception e) {
            log.error("Error processing chat request for user: {}", userId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new ChatResponse("❌ Đã xảy ra lỗi. Vui lòng thử lại sau."));
        }
    }
}
