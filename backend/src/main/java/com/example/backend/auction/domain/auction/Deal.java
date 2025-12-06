package com.example.backend.auction.domain.auction;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import com.example.backend.security.auth.User;

@Entity
@Table(name = "Deals")
public class Deal {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer dealID;

    @OneToOne
    @JoinColumn(name = "AuctionID", nullable = false, unique = true)
    private Auction auction;

    @ManyToOne
    @JoinColumn(name = "BuyerID", nullable = false)
    private User buyer;

    @ManyToOne
    @JoinColumn(name = "SellerID", nullable = false)
    private User seller;

    @Column(name = "FinalPrice", nullable = false)
    private BigDecimal finalPrice;

    @Column(name = "DealDate")
    private LocalDateTime dealDate = LocalDateTime.now();

    // Constructors
    public Deal() {
    }

    public Deal(Auction auction, User buyer, User seller, BigDecimal finalPrice) {
        this.auction = auction;
        this.buyer = buyer;
        this.seller = seller;
        this.finalPrice = finalPrice;
    }

    // Getters and Setters
    public Integer getDealID() {
        return dealID;
    }

    public void setDealID(Integer dealID) {
        this.dealID = dealID;
    }

    public Auction getAuction() {
        return auction;
    }

    public void setAuction(Auction auction) {
        this.auction = auction;
    }

    public User getBuyer() {
        return buyer;
    }

    public void setBuyer(User buyer) {
        this.buyer = buyer;
    }

    public User getSeller() {
        return seller;
    }

    public void setSeller(User seller) {
        this.seller = seller;
    }

    public BigDecimal getFinalPrice() {
        return finalPrice;
    }

    public void setFinalPrice(BigDecimal finalPrice) {
        this.finalPrice = finalPrice;
    }

    public LocalDateTime getDealDate() {
        return dealDate;
    }

    public void setDealDate(LocalDateTime dealDate) {
        this.dealDate = dealDate;
    }
}
