package com.example.backend.notification.listener;

import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import com.example.backend.auction.domain.auction.Auction;
import com.example.backend.auction.domain.auction.AuctionRepository;
import com.example.backend.auction.domain.auction.Bid;
import com.example.backend.auction.domain.auction.BidRepository;
import com.example.backend.event.AuctionWonEvent;
import com.example.backend.notification.domain.EmailNotification;
import com.example.backend.notification.domain.NotificationStatus;
import com.example.backend.notification.domain.NotificationType;
import com.example.backend.notification.repository.EmailNotificationRepository;
import com.example.backend.notification.service.EmailService;
import com.example.backend.security.auth.User;

@Component
public class AuctionEventsListener {

    private final AuctionRepository auctionRepo;
    private final BidRepository bidRepo;
    private final EmailService emailService;
    private final EmailNotificationRepository notifRepo;

    public AuctionEventsListener(AuctionRepository auctionRepo,
            BidRepository bidRepo,
            EmailService emailService,
            EmailNotificationRepository notifRepo) {
        this.auctionRepo = auctionRepo;
        this.bidRepo = bidRepo;
        this.emailService = emailService;
        this.notifRepo = notifRepo;
    }

    @Async
    @EventListener
    public void handleAuctionWon(AuctionWonEvent event) {
        Auction auction = auctionRepo.findById(event.getAuctionId())
                .orElseThrow(() -> new RuntimeException("Auction not found: " + event.getAuctionId()));
        Bid winnerBid = bidRepo.findById(event.getWinnerBidId())
                .orElseThrow(() -> new RuntimeException("Bid not found: " + event.getWinnerBidId()));

        User winner = auction.getWinner();
        User seller = auction.getItem().getSeller();

        // Check if already sent
        if (notifRepo.existsByTypeAndUserAndAuctionAndBid(
                NotificationType.AUCTION_WON, winner, auction, winnerBid)) {
            return;
        }

        try {
            // Mail to winner
            emailService.sendAuctionWonEmail(auction, winner, winnerBid);

            // Mail to seller
            emailService.sendAuctionSoldEmail(auction, seller, winnerBid);

            notifRepo.save(new EmailNotification(
                    winner, auction, winnerBid,
                    NotificationType.AUCTION_WON,
                    NotificationStatus.SUCCESS,
                    null));
        } catch (Exception ex) {
            notifRepo.save(new EmailNotification(
                    winner, auction, winnerBid,
                    NotificationType.AUCTION_WON,
                    NotificationStatus.FAILED,
                    ex.getMessage()));
        }
    }
}
