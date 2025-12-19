package com.example.backend.auction.controller;

import com.example.backend.auction.domain.auction.AuctionRepository;
import com.example.backend.auction.domain.message.Message;
import com.example.backend.auction.domain.message.MessageRepository;
import com.example.backend.auction.domain.message.dto.ConversationResponse;
import com.example.backend.auction.domain.message.dto.MessageRequest;
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
import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin
public class MessageController {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final AuctionRepository auctionRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public MessageController(MessageRepository messageRepository, UserRepository userRepository,
            AuctionRepository auctionRepository, SimpMessagingTemplate messagingTemplate) {
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.auctionRepository = auctionRepository;
        this.messagingTemplate = messagingTemplate;
    }

    @PostMapping
    public ResponseEntity<?> sendMessage(@RequestBody MessageRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        User sender = userRepository.findByUsername(userDetails.getUsername()).orElseThrow();
        User receiver = userRepository.findById(request.getReceiverId()).orElseThrow();

        Message message = new Message();
        message.setSender(sender);
        message.setReceiver(receiver);
        message.setContent(request.getContent());
        if (request.getAuctionId() != null) {
            auctionRepository.findById(request.getAuctionId()).ifPresent(message::setAuction);
        }
        // Lưu vào DB trước
        Message savedMsg = messageRepository.save(message);
        String itemTitle = (savedMsg.getAuction() != null) ? savedMsg.getAuction().getItem().getTitle() : null;
        Integer auctionId = (savedMsg.getAuction() != null) ? savedMsg.getAuction().getAuctionID() : null;

        // 👇 REAL-TIME: Gửi thông báo đến người nhận qua WebSocket
        // Kênh: /topic/user-{receiverId}
        SocketMessageDto socketDto = new SocketMessageDto(
                savedMsg.getContent(),
                savedMsg.getSender().getUserId(), // ID người gửi
                savedMsg.getSender().getUsername(), // Tên người gửi
                savedMsg.getSentAt(),
                auctionId,
                itemTitle);

        // Gửi cho người NHẬN (để họ thấy tin nhắn mới)
        messagingTemplate.convertAndSend("/topic/user-" + receiver.getUserId(), socketDto);

        // Gửi cho chính người GỬI (để đồng bộ nếu họ mở tab khác)
        messagingTemplate.convertAndSend("/topic/user-" + sender.getUserId(), socketDto);

        return ResponseEntity.ok("Sent");
    }

    @GetMapping("/history")
    public ResponseEntity<?> getChatHistory(
            @RequestParam Integer partnerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @AuthenticationPrincipal UserDetails userDetails) {

        if (userDetails == null)
            return ResponseEntity.status(401).build();

        // Sử dụng currentUser thay vì senderId parameter (fix security issue)
        User currentUser = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Integer currentUserId = currentUser.getUserId();

        List<Message> messages = messageRepository.findConversation(currentUserId, partnerId);

        // Apply pagination - lấy tin nhắn MỚI NHẤT (từ cuối danh sách)
        // Vì findConversation đã sort ASC (cũ nhất trước), ta cần lấy từ cuối
        int totalMessages = messages.size();

        // Tính start/end từ cuối danh sách để lấy tin mới nhất
        // page 0 = lấy N tin cuối cùng, page 1 = lấy N tin trước đó, etc.
        int end = Math.max(0, totalMessages - (page * size));
        int start = Math.max(0, end - size);

        List<Message> pagedMessages = messages.subList(start, end);

        // Map sang DTO đơn giản để trả về JSON
        List<MessageDto> response = pagedMessages.stream().map(m -> {
            MessageDto dto = new MessageDto();
            dto.setContent(m.getContent());
            dto.setSenderId(m.getSender().getUserId());
            dto.setCreatedAt(m.getSentAt() != null ? m.getSentAt().toString() : null);
            dto.setMine(m.getSender().getUserId().equals(currentUserId));
            return dto;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    // Inner DTO class cho gọn (hoặc bạn tạo file riêng)
    @lombok.Data
    static class MessageDto {
        private String content;
        private Integer senderId;
        private String createdAt;
        @JsonProperty("isMine")
        private boolean isMine;
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<ConversationResponse>> getConversations(
            @AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null)
            return ResponseEntity.status(401).build();

        User currentUser = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        Integer currentUserId = currentUser.getUserId();

        // 1. Lấy tất cả tin nhắn của tôi (đã sort mới nhất ở Repo)
        List<Message> allMessages = messageRepository.findLatestMessagesByUser(currentUserId);

        // 2. Lọc ra danh sách partner duy nhất
        List<ConversationResponse> conversations = new ArrayList<>();
        Set<Integer> processedPartnerIds = new HashSet<>();

        for (Message msg : allMessages) {
            // Xác định ai là "partner" trong tin nhắn này
            User partner = msg.getSender().getUserId().equals(currentUserId)
                    ? msg.getReceiver()
                    : msg.getSender();

            // Nếu chưa gặp partner này thì đây là tin nhắn mới nhất giữa 2 người -> Thêm
            // vào list
            if (!processedPartnerIds.contains(partner.getUserId())) {
                processedPartnerIds.add(partner.getUserId());

                conversations.add(new ConversationResponse(
                        partner.getUserId(),
                        partner.getUsername(), // Hoặc getFullName()
                        msg.getContent(),
                        formatTimeAgo(msg.getSentAt()), // Hàm helper convert time
                        msg.getSentAt()));
            }
        }

        return ResponseEntity.ok(conversations);
    }

    // Helper: Format thời gian kiểu "5 phút trước", "1 ngày trước"
    private String formatTimeAgo(java.time.LocalDateTime time) {
        if (time == null)
            return "";
        long seconds = Duration.between(time, java.time.LocalDateTime.now()).getSeconds();

        if (seconds < 60)
            return "Vừa xong";
        if (seconds < 3600)
            return (seconds / 60) + " phút";
        if (seconds < 86400)
            return (seconds / 3600) + " giờ";
        return (seconds / 86400) + " ngày";
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    static class SocketMessageDto {
        private String content;
        private Integer senderId;
        private String senderName;
        private LocalDateTime createdAt;
        private Integer auctionId;
        private String itemTitle;
    }

    // === USER SEARCH (for starting conversations) ===
    @GetMapping("/search-users")
    public ResponseEntity<?> searchUsers(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "20") int limit,
            @AuthenticationPrincipal UserDetails userDetails) {

        if (userDetails == null)
            return ResponseEntity.status(401).build();

        if (keyword == null || keyword.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Keyword is required");
        }

        User currentUser = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Search users by username (exclude current user)
        List<User> users = userRepository.searchByUsername(keyword.trim(), currentUser.getUserId());

        // Limit results and map to DTO
        List<UserSearchResultDto> response = users.stream()
                .limit(limit)
                .map(u -> new UserSearchResultDto(u.getUserId(), u.getUsername()))
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    static class UserSearchResultDto {
        private Integer userId;
        private String username;
    }

    // === MESSAGE SEARCH ===
    @GetMapping("/search")
    public ResponseEntity<?> searchMessages(
            @RequestParam String keyword,
            @RequestParam(defaultValue = "20") int limit,
            @AuthenticationPrincipal UserDetails userDetails) {

        if (userDetails == null)
            return ResponseEntity.status(401).build();

        if (keyword == null || keyword.trim().isEmpty()) {
            return ResponseEntity.badRequest().body("Keyword is required");
        }

        User currentUser = userRepository.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<Message> messages = messageRepository.searchMessages(currentUser.getUserId(), keyword.trim());

        // Limit results
        List<Message> limitedMessages = messages.stream()
                .limit(limit)
                .collect(Collectors.toList());

        // Map to DTO với thông tin partner
        List<SearchResultDto> response = limitedMessages.stream().map(m -> {
            User partner = m.getSender().getUserId().equals(currentUser.getUserId())
                    ? m.getReceiver()
                    : m.getSender();
            return new SearchResultDto(
                    m.getContent(),
                    m.getSentAt() != null ? m.getSentAt().toString() : null,
                    partner.getUserId(),
                    partner.getUsername(),
                    m.getSender().getUserId().equals(currentUser.getUserId()));
        }).collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    static class SearchResultDto {
        private String content;
        private String createdAt;
        private Integer partnerId;
        private String partnerName;
        @JsonProperty("isMine")
        private boolean isMine;
    }
}