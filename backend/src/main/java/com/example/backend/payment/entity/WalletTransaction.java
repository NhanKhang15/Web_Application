package com.example.backend.payment.entity;

import com.example.backend.auction.domain.auction.Auction;
import com.example.backend.security.auth.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "WalletTransactions")
@Getter
@Setter
public class WalletTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "TransactionID")
    private Long transactionId;

    @ManyToOne
    @JoinColumn(name = "UserID", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "Type", nullable = false)
    private TransactionType type;

    @Column(name = "Amount", nullable = false)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(name = "Direction", nullable = false)
    private Direction direction;

    @ManyToOne
    @JoinColumn(name = "RelatedAuctionID")
    private Auction relatedAuction;

    // Assuming Deal entity might not exist yet or is in another package not found.
    // Using simple column for now to match schema but without FK constraint in JPA
    // if entity missing.
    // If user insists on FK, I would need the entity.
    @Column(name = "RelatedDealID")
    private Integer relatedDealId;

    @ManyToOne
    @JoinColumn(name = "TopupID")
    private TopupOrder topupOrder;

    @Column(name = "StripePaymentIntentId", length = 100)
    private String stripePaymentIntentId;

    @Column(name = "StripeSessionId", length = 100)
    private String stripeSessionId;

    @Column(name = "Note")
    private String note;

    @CreationTimestamp
    @Column(name = "CreatedAt", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
