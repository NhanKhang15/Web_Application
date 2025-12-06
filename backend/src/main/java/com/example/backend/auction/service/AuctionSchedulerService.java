package com.example.backend.auction.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.example.backend.auction.domain.auction.AuctionRepository;

@Service
public class AuctionSchedulerService {

    private final AuctionRepository auctionRepo;
    private final AuctionEndService auctionEndService;

    public AuctionSchedulerService(AuctionRepository auctionRepo, AuctionEndService auctionEndService) {
        this.auctionRepo = auctionRepo;
        this.auctionEndService = auctionEndService;
    }

    @Scheduled(fixedDelay = 1000) // Scan every second
    public void scanExpiredAuctions() {
        // 1. Scheduled -> Open
        auctionRepo.updateScheduledToOpen();

        // 2. Find expired auctions
        java.util.List<Integer> expiredAuctionIds = auctionRepo.findExpiredAuctionIds(
                com.example.backend.auction.domain.item.AuctionStatus.Open, java.time.LocalDateTime.now());

        for (Integer auctionId : expiredAuctionIds) {
            try {
                // Process auction end logic
                auctionEndService.processAuctionEnd(auctionId);
            } catch (Exception e) {
                // Log error to avoid blocking other auctions
                e.printStackTrace();
            }
        }
    }
}
