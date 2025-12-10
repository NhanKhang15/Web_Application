package com.example.backend.auction.service;

import com.example.backend.auction.domain.auction.*;
import com.example.backend.auction.domain.item.AuctionStatus;
import com.example.backend.event.AuctionCancelledEvent;
import com.example.backend.event.AuctionWonEvent;
import com.example.backend.event.RefundLosersEvent;
import com.example.backend.payment.entity.*;
import com.example.backend.payment.repository.WalletRepository;
import com.example.backend.payment.repository.WalletTransactionRepository;
import com.example.backend.security.auth.User;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AuctionEndService {

    private final AuctionRepository auctionRepo;
    private final BidRepository bidRepo;
    private final DealRepository dealRepo;
    private final WalletRepository walletRepo;
    private final WalletTransactionRepository transactionRepo;
    private final ApplicationEventPublisher eventPublisher;

    public AuctionEndService(AuctionRepository auctionRepo, BidRepository bidRepo,
            DealRepository dealRepo, WalletRepository walletRepo,
            WalletTransactionRepository transactionRepo, ApplicationEventPublisher eventPublisher) {
        this.auctionRepo = auctionRepo;
        this.bidRepo = bidRepo;
        this.dealRepo = dealRepo;
        this.walletRepo = walletRepo;
        this.transactionRepo = transactionRepo;
        this.eventPublisher = eventPublisher;
    }

    /**
     * Process auction end - called by scheduler or early end action.
     * This is the ONLY entry point for ending an auction.
     */
    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public void processAuctionEnd(Integer auctionId) {
        // 1. Lock Auction
        Auction auction = auctionRepo.findByIdForUpdate(auctionId)
                .orElseThrow(() -> new RuntimeException("Auction not found"));

        // Double-check locking - only process Open auctions
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
        BigDecimal finalPrice = winnerBid.getBidAmount();

        // 3. Process Payment Transfer: Buyer -> Seller
        transferPayment(winner, seller, finalPrice, auction);

        // 4. Create Deal
        Deal deal = new Deal(auction, winner, seller, finalPrice);
        dealRepo.save(deal);

        // 5. Update Auction
        auction.setWinner(winner);
        auction.setFinalPrice(finalPrice);
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

    /**
     * Cancel auction - refund ALL bidders, no winner.
     * Called when seller wants to close auction without selling.
     */
    @Transactional(isolation = Isolation.REPEATABLE_READ)
    public void cancelAuction(Integer auctionId) {
        // 1. Lock Auction
        Auction auction = auctionRepo.findByIdForUpdate(auctionId)
                .orElseThrow(() -> new RuntimeException("Auction not found"));

        // Can only cancel Open or Scheduled auctions
        if (auction.getStatus() != AuctionStatus.Open && auction.getStatus() != AuctionStatus.Scheduled) {
            throw new RuntimeException("Cannot cancel auction with status: " + auction.getStatus());
        }

        // 2. Get all bids
        List<Bid> allBids = bidRepo.findByAuction_AuctionIDOrderByBidTimeDesc(auctionId);

        // 3. Update status to Cancelled
        auction.setStatus(AuctionStatus.Cancelled);
        auctionRepo.save(auction);

        // 4. Refund all bidders (async)
        if (!allBids.isEmpty()) {
            List<Integer> allBidIds = allBids.stream().map(Bid::getBidID).collect(Collectors.toList());
            eventPublisher.publishEvent(new AuctionCancelledEvent(this, auctionId, allBidIds));
        }
    }

    /**
     * Transfer payment from buyer to seller.
     * The bid amount was already frozen (deducted) when placing the bid.
     * So we only need to add to seller's wallet.
     */
    private void transferPayment(User buyer, User seller, BigDecimal amount, Auction auction) {
        // Get seller wallet
        Wallet sellerWallet = walletRepo.findByUser_UserId(seller.getUserId())
                .orElseThrow(() -> new RuntimeException("Seller wallet not found"));

        // Add to seller wallet
        sellerWallet.setBalance(sellerWallet.getBalance().add(amount));
        walletRepo.save(sellerWallet);

        // Record transaction for buyer (PAYMENT - OUT)
        WalletTransaction buyerTx = new WalletTransaction();
        buyerTx.setUser(buyer);
        buyerTx.setAmount(amount);
        buyerTx.setType(TransactionType.PAYMENT);
        buyerTx.setDirection(Direction.OUT);
        buyerTx.setRelatedAuction(auction);
        buyerTx.setNote("Payment for winning auction #" + auction.getAuctionID());
        transactionRepo.save(buyerTx);

        // Record transaction for seller (SALE_INCOME - IN)
        WalletTransaction sellerTx = new WalletTransaction();
        sellerTx.setUser(seller);
        sellerTx.setAmount(amount);
        sellerTx.setType(TransactionType.SALE_INCOME);
        sellerTx.setDirection(Direction.IN);
        sellerTx.setRelatedAuction(auction);
        sellerTx.setNote("Sale income from auction #" + auction.getAuctionID());
        transactionRepo.save(sellerTx);
    }
}
