package com.example.backend.payment.entity;

import com.example.backend.security.auth.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "TopupOrders")
@Getter
@Setter
public class TopupOrder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "TopupID")
    private Long topupId;

    @ManyToOne
    @JoinColumn(name = "UserID", nullable = false)
    private User user;

    @Column(name = "Amount", nullable = false)
    private BigDecimal amount;

    @Column(name = "Currency", nullable = false, length = 3)
    private String currency = "VND";

    @Column(name = "StripeSessionId", unique = true, length = 100)
    private String stripeSessionId;

    @Column(name = "StripePaymentIntentId", length = 100)
    private String stripePaymentIntentId;

    @Enumerated(EnumType.STRING)
    @Column(name = "Status", nullable = false)
    private TopupStatus status = TopupStatus.PENDING;

    @CreationTimestamp
    @Column(name = "CreatedAt", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "UpdatedAt", nullable = false)
    private LocalDateTime updatedAt;
}
