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

import com.example.backend.category.CategoryRepository; // 👇 Import Repo của bạn
import com.example.backend.category.Category;
import com.example.backend.auction.domain.auction.dto.FilterOptionsDto;
import com.example.backend.auction.domain.auction.dto.CategoryDto;
import com.example.backend.auction.domain.item.AuctionItemsRepository;

import java.util.Collections;
import java.util.List;

@Service
public class ActiveItemsService {

    private final AuctionRepository auctionRepo;
    private final AuctionImgRepository imgRepo;
    private final AuctionItemsRepository itemRepo;
    private final CategoryRepository categoryRepo;


    public ActiveItemsService(AuctionRepository auctionRepo, AuctionImgRepository imgRepo, AuctionItemsRepository itemRepo, CategoryRepository categoryRepo) {
        this.auctionRepo = auctionRepo;
        this.imgRepo = imgRepo;
        this.itemRepo = itemRepo;
        this.categoryRepo = categoryRepo;
    }

    @Transactional(readOnly = true)
    public Page<ActiveAuctionDto> listActiveAuctions(Integer categoryId, String from, String to, Pageable pageable) {
        String safeFrom = (from == null || from.trim().isEmpty()) ? "2000-01-01 00:00:00" : from;
        String safeTo = (to == null || to.trim().isEmpty()) ? "2099-12-31 23:59:59" : to;

        if (categoryId != null) {
            return auctionRepo.findActiveAuctionsByCategory(safeFrom, safeTo, categoryId, pageable);
        }
        // Nếu không thì gọi hàm lấy tất cả như cũ
        return auctionRepo.findActiveAuctionsCustom(safeFrom, safeTo, pageable);
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

    @Transactional(readOnly = true)
    public FilterOptionsDto getFilterOptions() {
        // 1. Lấy danh sách địa điểm (Location) duy nhất từ Repo Item
        List<String> locations = itemRepo.findDistinctLocations();

        // 2. Lấy danh sách danh mục từ CategoryRepository của bạn
        List<Category> activeCats = categoryRepo.findActiveCategories();

        // Map từ Entity sang DTO nhỏ gọn
        List<CategoryDto> categoryDtos = activeCats.stream()
                .map(c -> new CategoryDto(c.getCategoryId(), c.getCategoryName()))
                .toList();

        // 3. Trả về DTO tổng
        return new FilterOptionsDto(categoryDtos, locations);
    }

    @Transactional(readOnly = true)
    public Page<ActiveAuctionDto> searchAuctions(String keyword, Pageable pageable) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return Page.empty(pageable);
        }
        String defaultFrom = "2000-01-01 00:00:00";
        String defaultTo = "2099-12-31 23:59:59";

        // Gọi repository để tìm kiếm theo title
        return auctionRepo.searchAuctionsByTitle(defaultFrom, defaultTo, keyword.trim(), pageable);
    }
}