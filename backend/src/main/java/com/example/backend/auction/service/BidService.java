package com.example.backend.auction.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.auction.domain.auction.Auction;
import com.example.backend.auction.domain.auction.AuctionRepository;
import com.example.backend.auction.domain.auction.Bid;
import com.example.backend.auction.domain.auction.BidRepository;
import com.example.backend.auction.domain.auction.dto.BidResult;
import com.example.backend.auction.domain.item.AuctionStatus;
import com.example.backend.auction.event.AuctionUpdatedEvent;
import com.example.backend.security.auth.User;
import com.example.backend.security.auth.UserRepository; // Need to find where UserRepository is

@Service
public class BidService {

    private final AuctionRepository auctionRepository;
    private final BidRepository bidRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final org.springframework.context.ApplicationEventPublisher eventPublisher;

    public BidService(AuctionRepository auctionRepository, BidRepository bidRepository, UserRepository userRepository,
            SimpMessagingTemplate messagingTemplate,
            org.springframework.context.ApplicationEventPublisher eventPublisher) {
        this.auctionRepository = auctionRepository;
        this.bidRepository = bidRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public BidResult placeBid(Integer auctionId, Integer userId, BigDecimal amount) {
        // 1. Lock auction
        Auction auction = auctionRepository.findByIdForUpdate(auctionId)
                .orElseThrow(() -> new RuntimeException("Auction not found"));

        LocalDateTime now = LocalDateTime.now();

        // Check status and time
        if (auction.getStatus() != AuctionStatus.Open || now.isAfter(auction.getEndDate())) {
            return BidResult.failed("Auction is not open or has ended");
        }

        // Check amount
        BigDecimal minNextBid = auction.getCurrentPrice().add(auction.getMinStep());
        // If current price is starting price and no bids yet, maybe logic differs?
        // But usually current price starts at starting price.
        // If no bids, first bid must be >= starting price.
        // The logic in pseudocode: minNextBid = currentPrice + minIncrement.
        // If currentPrice is 0 (init), trigger sets it to StartingPrice.
        // So if StartingPrice 100, MinStep 10. CurrentPrice 100. MinNextBid 110.
        // Wait, if no one bid yet, can I bid 100?
        // Usually yes.
        // Let's check if there are any bids.
        // If currentHighestBidId is null, it means no bids.

        if (auction.getCurrentHighestBidId() == null) {
            // No bids yet. Must be >= StartingPrice.
            if (amount.compareTo(auction.getStartingPrice()) < 0) {
                return BidResult.failed("Bid must be at least the starting price");
            }
        } else {
            if (amount.compareTo(minNextBid) < 0) {
                return BidResult.failed("Bid too low. Minimum bid is " + minNextBid);
            }
        }

        User bidder = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2. Save bid
        Bid bid = new Bid();
        bid.setAuction(auction);
        bid.setBidder(bidder);
        bid.setBidAmount(amount);
        bid.setBidTime(now);
        bidRepository.save(bid);

        // 3. Update auction
        auction.setCurrentPrice(amount);
        auction.setCurrentHighestBidId(bid.getBidID());
        auctionRepository.save(auction);

        // 4. Publish event
        AuctionUpdatedEvent event = new AuctionUpdatedEvent(
                auction.getAuctionID(),
                auction.getCurrentPrice(),
                bidder.getUserId(),
                bidder.getUsername());
        messagingTemplate.convertAndSend("/topic/auctions/" + auction.getAuctionID(), event);

        // 5. Publish BidPlacedEvent (Async email)
        eventPublisher.publishEvent(new com.example.backend.event.BidPlacedEvent(this, bid.getBidID()));

        return BidResult.success(bid);
    }

    public java.util.List<Bid> getBidsForAuction(Integer auctionId) {
        return bidRepository.findByAuction_AuctionIDOrderByBidTimeDesc(auctionId);
    }
}
