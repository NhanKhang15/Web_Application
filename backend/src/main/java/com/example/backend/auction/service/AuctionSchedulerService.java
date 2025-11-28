package com.example.backend.auction.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.example.backend.auction.domain.auction.AuctionRepository;

@Service
public class AuctionSchedulerService {

    private final AuctionRepository auctionRepo;
    private final com.example.backend.auction.domain.auction.BidRepository bidRepo;
    private final org.springframework.context.ApplicationEventPublisher eventPublisher;

    public AuctionSchedulerService(AuctionRepository auctionRepo,
            com.example.backend.auction.domain.auction.BidRepository bidRepo,
            org.springframework.context.ApplicationEventPublisher eventPublisher) {
        this.auctionRepo = auctionRepo;
        this.bidRepo = bidRepo;
        this.eventPublisher = eventPublisher;
    }

    @Scheduled(fixedDelay = 60000) // Run every 60 seconds
    @org.springframework.transaction.annotation.Transactional
    public void updateAuctionStatus() {
        // 1. Scheduled -> Open
        auctionRepo.updateScheduledToOpen();

        // 2. Open -> Ended (with events)
        closeExpiredAuctions();
    }

    private void closeExpiredAuctions() {
        java.util.List<com.example.backend.auction.domain.auction.Auction> expiredAuctions = auctionRepo
                .findAllByStatusAndEndDateBefore(
                        com.example.backend.auction.domain.item.AuctionStatus.Open, java.time.LocalDateTime.now());

        for (com.example.backend.auction.domain.auction.Auction auction : expiredAuctions) {
            closeAuction(auction);
        }
    }

    private void closeAuction(com.example.backend.auction.domain.auction.Auction auction) {
        // Find highest bid
        java.util.Optional<com.example.backend.auction.domain.auction.Bid> winnerBidOpt = bidRepo
                .findTopByAuctionOrderByBidAmountDesc(auction);

        if (winnerBidOpt.isPresent()) {
            com.example.backend.auction.domain.auction.Bid winnerBid = winnerBidOpt.get();
            auction.setStatus(com.example.backend.auction.domain.item.AuctionStatus.Ended);
            auction.setWinner(winnerBid.getBidder());
            auction.setFinalPrice(winnerBid.getBidAmount());
            auctionRepo.save(auction);

            // Publish event
            eventPublisher.publishEvent(
                    new com.example.backend.event.AuctionWonEvent(this, auction.getAuctionID(), winnerBid.getBidID()));
        } else {
            // No bids -> Closed
            auction.setStatus(com.example.backend.auction.domain.item.AuctionStatus.Closed);
            auctionRepo.save(auction);
        }
    }
}
