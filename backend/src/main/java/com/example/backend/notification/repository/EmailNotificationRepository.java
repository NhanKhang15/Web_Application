package com.example.backend.notification.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.auction.domain.auction.Auction;
import com.example.backend.auction.domain.auction.Bid;
import com.example.backend.notification.domain.EmailNotification;
import com.example.backend.notification.domain.NotificationType;
import com.example.backend.security.auth.User;

@Repository
public interface EmailNotificationRepository extends JpaRepository<EmailNotification, Integer> {

    boolean existsByTypeAndUserAndAuctionAndBid(
            NotificationType type,
            User user,
            Auction auction,
            Bid bid);
}
