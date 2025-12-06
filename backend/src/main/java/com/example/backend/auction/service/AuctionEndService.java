package com.example.backend.auction.service;

import com.example.backend.auction.domain.auction.*;
import com.example.backend.auction.domain.item.AuctionStatus;
import com.example.backend.event.AuctionWonEvent;
import com.example.backend.event.RefundLosersEvent;
import com.example.backend.security.auth.User;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuctionEndService {

    private final AuctionRepository auctionRepo;
    private final BidRepository bidRepo;
    private final DealRepository dealRepo;
    private final ApplicationEventPublisher eventPublisher;

    public AuctionEndService(AuctionRepository auctionRepo, BidRepository bidRepo,
            DealRepository dealRepo, ApplicationEventPublisher eventPublisher) {
        this.auctionRepo = auctionRepo;
        this.bidRepo = bidRepo;
        this.dealRepo = dealRepo;
        this.eventPublisher = eventPublisher;
    }

    // LOCKING & PROCESSING - Step 1, 2, 3 (Winner)
    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public void processAuctionEnd(Integer auctionId) {
        // 1. Lock Auction
        Auction auction = auctionRepo.findByIdForUpdate(auctionId)
                .orElseThrow(() -> new RuntimeException("Auction not found"));

        // Double-check locking
        if (auction.getStatus() != AuctionStatus.Open) {
            return;
        }

        // Switch to Processing immediately
        auction.setStatus(AuctionStatus.Processing);
        auctionRepo.save(auction);

        // 2. Determine Winner and Losers
        List<Bid> allBids = bidRepo.findByAuction_AuctionIDOrderByBidTimeDesc(auctionId);

        if (allBids.isEmpty()) {
            auction.setStatus(AuctionStatus.Closed);
            auctionRepo.save(auction);
            return;
        }

        Bid winnerBid = allBids.get(0); // Highest/Latest bid
        List<Bid> loserBids = allBids.subList(1, allBids.size());

        User winner = winnerBid.getBidder();
        User seller = auction.getItem().getSeller();

        // 3. Process Winner (Money already deducted, just create Deal)
        Deal deal = new Deal(auction, winner, seller, winnerBid.getBidAmount());
        dealRepo.save(deal);

        // Update Auction
        auction.setWinner(winner);
        auction.setFinalPrice(winnerBid.getBidAmount());
        auction.setStatus(AuctionStatus.Ended);
        auctionRepo.save(auction);

        // --- Dispatch Jobs to Queues ---

        // Job 1: Refund Queue (Async - Fire & Forget)
        List<Integer> loserBidIds = loserBids.stream().map(Bid::getBidID).collect(Collectors.toList());
        if (!loserBidIds.isEmpty()) {
            eventPublisher.publishEvent(new RefundLosersEvent(this, auctionId, loserBidIds));
        }

        // Job 2: Notification & WebSocket (Async)
        eventPublisher.publishEvent(new AuctionWonEvent(this, auctionId, winnerBid.getBidID()));
    }
}
