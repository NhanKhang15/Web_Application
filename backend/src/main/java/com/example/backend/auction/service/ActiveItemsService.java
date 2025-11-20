package com.example.backend.auction.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.auction.domain.auction.dto.ActiveAuctionDto;
import com.example.backend.auction.domain.auction.dto.AuctionDetailDto;
import com.example.backend.auction.domain.auction.dto.AuctionDetailProjection;
import com.example.backend.auction.domain.auction.AuctionRepository;
import com.example.backend.auction.domain.item.AuctionImgRepository;

import java.util.List;

@Service
public class ActiveItemsService {

    private final AuctionRepository auctionRepo;
    private final AuctionImgRepository imgRepo;

    public ActiveItemsService(AuctionRepository auctionRepo, AuctionImgRepository imgRepo) {
        this.auctionRepo = auctionRepo;
        this.imgRepo = imgRepo;
    }

    @Transactional(readOnly = true)
    public Page<ActiveAuctionDto> listActiveAuctions(Integer categoryId, Pageable pageable) {
        if (categoryId != null) {
            return auctionRepo.findActiveAuctionsByCategory(categoryId, pageable);
        }
        // Nếu không thì gọi hàm lấy tất cả như cũ
        return auctionRepo.findActiveAuctionsCustom(pageable);
    }

    @Transactional(readOnly = true)
    public AuctionDetailDto getAuctionDetailBySlug(String slug) {
        // 1. Tìm thông tin chính
        AuctionDetailProjection proj = auctionRepo.findDetailBySlug(slug)
                .orElseThrow(
                        () -> new RuntimeException("Không tìm thấy sản phẩm hoặc phiên đấu giá với slug: " + slug));

        // 2. Lấy danh sách ảnh dựa trên ItemID vừa tìm được
        List<String> images = imgRepo.findAllImgUrlsByItemId(proj.getItemId());

        // 3. Map sang DTO
        return new AuctionDetailDto(
                proj.getItemId(),
                proj.getSellerId(),
                proj.getCategoryName(),
                proj.getCategoryId(),
                proj.getTitle(),
                proj.getSlug(),
                proj.getDescription(),
                proj.getLocation(),
                proj.getStartingPrice(),
                proj.getMinStep(),
                proj.getCurrentPrice(),
                proj.getReservePrice(),
                proj.getBuyNowPrice(),
                proj.getStatus(),
                proj.getStartDate(),
                proj.getEndDate(),
                proj.getCreatedAt(),
                proj.getUpdatedAt(),
                proj.getSellerName(), // Tên người bán
                images // List ảnh
        );
    }
}