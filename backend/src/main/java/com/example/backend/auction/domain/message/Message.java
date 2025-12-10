package com.example.backend.auction.domain.message;

import com.example.backend.auction.domain.auction.Auction;
import com.example.backend.security.auth.User; // Hoặc entity User của bạn
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "Messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer messageID;

    @ManyToOne
    @JoinColumn(name = "SenderID", nullable = false)
    private User sender;

    @ManyToOne
    @JoinColumn(name = "ReceiverID", nullable = false)
    private User receiver;

    @ManyToOne
    @JoinColumn(name = "AuctionID")
    private Auction auction;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "SentAt")
    private LocalDateTime sentAt;

    @Column(name = "IsRead")
    @lombok.Builder.Default
    private Boolean isRead = false;

    @Column(name = "ReadAt")
    private LocalDateTime readAt;

    @PrePersist
    protected void onCreate() {
        sentAt = LocalDateTime.now();
    }
}