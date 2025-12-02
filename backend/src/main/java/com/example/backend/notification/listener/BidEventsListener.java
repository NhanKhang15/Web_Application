package com.example.backend.notification.listener;

import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

import com.example.backend.auction.domain.auction.Bid;
import com.example.backend.auction.domain.auction.BidRepository;
import com.example.backend.event.BidPlacedEvent;
import com.example.backend.notification.domain.EmailNotification;
import com.example.backend.notification.domain.NotificationStatus;
import com.example.backend.notification.domain.NotificationType;
import com.example.backend.notification.repository.EmailNotificationRepository;
import com.example.backend.notification.service.EmailService;

@Component
public class BidEventsListener {

    private final BidRepository bidRepo;
    private final EmailService emailService;
    private final EmailNotificationRepository notifRepo;

    public BidEventsListener(BidRepository bidRepo,
            EmailService emailService,
            EmailNotificationRepository notifRepo) {
        this.bidRepo = bidRepo;
        this.emailService = emailService;
        this.notifRepo = notifRepo;
    }

    @Async
    @EventListener
    public void handleBidPlaced(BidPlacedEvent event) {
        Bid bid = bidRepo.findById(event.getBidId())
                .orElseThrow(() -> new RuntimeException("Bid not found: " + event.getBidId()));

        // Check if already sent
        if (notifRepo.existsByTypeAndUserAndAuctionAndBid(
                NotificationType.BID_PLACED, bid.getBidder(), bid.getAuction(), bid)) {
            return;
        }

        try {
            emailService.sendBidPlacedEmail(bid);

            notifRepo.save(new EmailNotification(
                    bid.getBidder(), bid.getAuction(), bid,
                    NotificationType.BID_PLACED,
                    NotificationStatus.SUCCESS,
                    null));
        } catch (Exception ex) {
            notifRepo.save(new EmailNotification(
                    bid.getBidder(), bid.getAuction(), bid,
                    NotificationType.BID_PLACED,
                    NotificationStatus.FAILED,
                    ex.getMessage()));
        }
    }
}
