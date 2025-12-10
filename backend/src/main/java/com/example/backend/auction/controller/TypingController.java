package com.example.backend.auction.controller;

import com.example.backend.security.auth.User;
import com.example.backend.security.auth.UserRepository;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/typing")
@CrossOrigin
public class TypingController {

    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public TypingController(UserRepository userRepository, SimpMessagingTemplate messagingTemplate) {
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @PostMapping
    public ResponseEntity<?> sendTypingStatus(
            @RequestBody TypingRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {

        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }

        User currentUser = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Gửi typing event đến người nhận qua WebSocket
        TypingEvent event = new TypingEvent(
                currentUser.getUserId(),
                currentUser.getUsername(),
                request.isTyping());

        messagingTemplate.convertAndSend("/topic/typing-" + request.getReceiverId(), event);

        return ResponseEntity.ok().build();
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    static class TypingRequest {
        private Integer receiverId;
        private boolean typing;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    static class TypingEvent {
        private Integer senderId;
        private String senderName;
        private boolean typing;
    }
}
