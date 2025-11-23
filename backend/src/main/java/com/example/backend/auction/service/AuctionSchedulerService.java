package com.example.backend.auction.service;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.example.backend.auction.domain.auction.AuctionRepository;

@Service
public class AuctionSchedulerService {

    private final AuctionRepository auctionRepo;

    public AuctionSchedulerService(AuctionRepository auctionRepo) {
        this.auctionRepo = auctionRepo;
    }

    @Scheduled(cron = "0 */2 * * * *") // Chạy mỗi 2 phút
    public void updateAuctionStatus() {
        // 1. Đổi Scheduled → Open khi đã đến StartDate
        auctionRepo.updateScheduledToOpen();
        
        // 2. Đổi Open → Ended khi EndDate đã quá hạn
        auctionRepo.updateOpenToEnded();
    }
}
