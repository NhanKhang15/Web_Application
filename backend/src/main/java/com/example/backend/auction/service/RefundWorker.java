package com.example.backend.auction.service;

import com.example.backend.auction.domain.auction.Bid;
import com.example.backend.auction.domain.auction.BidRepository;
import com.example.backend.event.RefundLosersEvent;
import com.example.backend.payment.entity.*;
import com.example.backend.payment.repository.WalletRepository;
import com.example.backend.payment.repository.WalletTransactionRepository;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Component
public class RefundWorker {

    private final BidRepository bidRepo;
    private final WalletRepository walletRepo;
    private final WalletTransactionRepository transactionRepo;

    public RefundWorker(BidRepository bidRepo, WalletRepository walletRepo,
            WalletTransactionRepository transactionRepo) {
        this.bidRepo = bidRepo;
        this.walletRepo = walletRepo;
        this.transactionRepo = transactionRepo;
    }

    @Async
    @EventListener
    public void handleRefunds(RefundLosersEvent event) {
        List<Integer> bidIds = event.getLoserBidIds();

        for (Integer bidId : bidIds) {
            refundSingleBid(bidId);
        }
    }

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void refundSingleBid(Integer bidId) {
        try {
            Bid bid = bidRepo.findById(bidId).orElse(null);
            if (bid == null)
                return;

            // Refund logic
            Wallet wallet = walletRepo.findByUser_UserId(bid.getBidder().getUserId())
                    .orElseThrow(() -> new RuntimeException("Wallet not found"));

            // Add money back
            wallet.setBalance(wallet.getBalance().add(bid.getBidAmount()));
            walletRepo.save(wallet);

            // Log transaction
            WalletTransaction trx = new WalletTransaction();
            trx.setUser(bid.getBidder());
            trx.setAmount(bid.getBidAmount());
            trx.setType(TransactionType.REFUND);
            trx.setDirection(Direction.IN);
            trx.setRelatedAuction(bid.getAuction());
            trx.setNote("Refund for outbid auction #" + bid.getAuction().getAuctionID());
            transactionRepo.save(trx);

        } catch (Exception e) {
            System.err.println("Failed to refund bid " + bidId + ": " + e.getMessage());
        }
    }
}
