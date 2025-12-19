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
import com.example.backend.security.auth.UserRepository;
import com.example.backend.payment.repository.WalletRepository;
import com.example.backend.payment.repository.WalletTransactionRepository;
import com.example.backend.payment.entity.Wallet;
import com.example.backend.payment.entity.WalletTransaction;
import com.example.backend.payment.entity.TransactionType;
import com.example.backend.payment.entity.Direction;

@Service
public class BidService {

    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final AuctionRepository auctionRepository;
    private final BidRepository bidRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final org.springframework.context.ApplicationEventPublisher eventPublisher;
    private final AuctionEndService auctionEndService;

    public BidService(AuctionRepository auctionRepository, BidRepository bidRepository, UserRepository userRepository,
            SimpMessagingTemplate messagingTemplate,
            org.springframework.context.ApplicationEventPublisher eventPublisher,
            WalletRepository walletRepository,
            WalletTransactionRepository walletTransactionRepository,
            AuctionEndService auctionEndService) {
        this.auctionRepository = auctionRepository;
        this.bidRepository = bidRepository;
        this.userRepository = userRepository;
        this.messagingTemplate = messagingTemplate;
        this.eventPublisher = eventPublisher;
        this.walletRepository = walletRepository;
        this.walletTransactionRepository = walletTransactionRepository;
        this.auctionEndService = auctionEndService;
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

        // --- Wallet Logic Start ---
        Wallet wallet = walletRepository.findByUser_UserId(userId)
                .orElseThrow(() -> new RuntimeException("Wallet not found for user"));

        // Calculate amount to deduct (Differential logic)
        BigDecimal amountToDeduct = amount;
        java.util.Optional<Bid> previousBidOpt = bidRepository
                .findTopByAuction_AuctionIDAndBidder_UserIdOrderByBidAmountDesc(auctionId, userId);

        if (previousBidOpt.isPresent()) {
            BigDecimal previousMaxBid = previousBidOpt.get().getBidAmount();
            if (amount.compareTo(previousMaxBid) > 0) {
                amountToDeduct = amount.subtract(previousMaxBid);
            } else {
                // New bid is lower or equal to previous max bid?
                // Logic says we shouldn't be here if validation passed (minNextBid check).
                // But if for some reason it happens, we deduct 0 or handle it.
                // Assuming standard flow, new bid > previous max bid.
                amountToDeduct = BigDecimal.ZERO;
            }
        }

        if (amountToDeduct.compareTo(BigDecimal.ZERO) > 0) {
            if (wallet.getBalance().compareTo(amountToDeduct) < 0) {
                return BidResult.failed("Insufficient wallet balance to cover the bid increase");
            }

            // Deduct balance
            wallet.setBalance(wallet.getBalance().subtract(amountToDeduct));
            walletRepository.save(wallet);

            // Create Transaction
            WalletTransaction transaction = new WalletTransaction();
            transaction.setUser(bidder);
            transaction.setAmount(amountToDeduct);
            transaction.setType(TransactionType.BID_FREEZE);
            transaction.setDirection(Direction.OUT);
            transaction.setRelatedAuction(auction);
            transaction.setNote("Bid placed on auction " + auctionId + " (Deducted: " + amountToDeduct + ")");
            walletTransactionRepository.save(transaction);
        }
        // --- Wallet Logic End ---

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

    @Transactional
    public BidResult buyNow(Integer auctionId, Integer userId) {
        // 1. Lock Auction
        Auction auction = auctionRepository.findByIdForUpdate(auctionId)
                .orElseThrow(() -> new RuntimeException("Auction not found"));

        // Validate Status
        if (auction.getStatus() != AuctionStatus.Open) {
            return BidResult.failed("Auction is not open");
        }

        // Validate Buy Now Price
        if (auction.getBuyNowPrice() == null) {
            return BidResult.failed("This auction does not have a Buy Now price");
        }

        LocalDateTime now = LocalDateTime.now();
        if (now.isAfter(auction.getEndDate())) {
            return BidResult.failed("Auction has ended");
        }

        User buyer = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        BigDecimal buyNowPrice = auction.getBuyNowPrice();

        // --- Wallet Logic ---
        Wallet wallet = walletRepository.findByUser_UserId(userId)
                .orElseGet(() -> {
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new RuntimeException("User not found"));
                    Wallet w = new Wallet();
                    w.setUser(user);
                    w.setBalance(BigDecimal.ZERO);
                    return walletRepository.save(w);
                });

        // Calculate deduction: Price - (Previous Max Bid if exists)
        BigDecimal amountToDeduct = buyNowPrice;
        java.util.Optional<Bid> previousBidOpt = bidRepository
                .findTopByAuction_AuctionIDAndBidder_UserIdOrderByBidAmountDesc(auctionId, userId);

        if (previousBidOpt.isPresent()) {
            BigDecimal previousMaxBid = previousBidOpt.get().getBidAmount();
            if (buyNowPrice.compareTo(previousMaxBid) > 0) {
                amountToDeduct = buyNowPrice.subtract(previousMaxBid);
            } else {
                // Should not happen if BuyNow > Starting/Current Price logic is enforced
                amountToDeduct = BigDecimal.ZERO;
            }
        }

        if (amountToDeduct.compareTo(BigDecimal.ZERO) > 0) {
            if (wallet.getBalance().compareTo(amountToDeduct) < 0) {
                return BidResult.failed("Insufficient wallet balance for Buy Now");
            }

            // Deduct
            wallet.setBalance(wallet.getBalance().subtract(amountToDeduct));
            walletRepository.save(wallet);

            // Transaction Log
            WalletTransaction transaction = new WalletTransaction();
            transaction.setUser(buyer);
            transaction.setAmount(amountToDeduct);
            transaction.setType(TransactionType.BID_FREEZE); // Treating as frozen funds until transfer
            transaction.setDirection(Direction.OUT);
            transaction.setRelatedAuction(auction);
            transaction.setNote("Buy Now payment for auction " + auctionId);
            walletTransactionRepository.save(transaction);
        }
        // --- End Wallet Logic ---

        // 2. Place "Buy Now" Bid
        Bid bid = new Bid();
        bid.setAuction(auction);
        bid.setBidder(buyer);
        bid.setBidAmount(buyNowPrice);
        bid.setBidTime(now);
        bidRepository.save(bid);

        // 3. Update Auction Price/Winner
        auction.setCurrentPrice(buyNowPrice);
        auction.setCurrentHighestBidId(bid.getBidID());
        auctionRepository.save(auction);

        // 4. End Auction Immediately
        // Because we just placed the highest bid (Buy Now Price), this user is the
        // winner.
        // processAuctionEnd handling the transfer from "Frozen" state to Seller is
        // handled by
        // AuctionEndService (it sees the winner and transfers funds).
        // Wait! In placeBid we freeze funds. In processAuctionEnd we transfer.
        // Yes, processAuctionEnd takes 'finalPrice' (which is winnerBid.amount) and
        // transfers it.
        // But wait, processAuctionEnd *assumes* the money is already in the system
        // (deducted/frozen).
        // In placeBid we deducted 'amountToDeduct' (difference).
        // If user had previous bid 100, and BuyNow is 500. We deduct 400. Total frozen
        // = 500.
        // processAuctionEnd transfers 500 to seller. Correct.

        auctionEndService.processAuctionEnd(auctionId);

        return BidResult.success(bid);
    }

    public java.util.List<Bid> getBidsForAuction(Integer auctionId) {
        return bidRepository.findByAuction_AuctionIDOrderByBidTimeDesc(auctionId);
    }
}
