package com.example.backend.auction.service;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.auction.domain.auction.AuctionRepository;
import com.example.backend.auction.domain.auction.dto.AuctionDetailDto;
import com.example.backend.auction.domain.auction.dto.AuctionDetailProjection;
import com.example.backend.auction.domain.auction.dto.AuctionDto;
import com.example.backend.auction.domain.auction.dto.EndedAuctionDto;
import com.example.backend.auction.domain.auction.dto.ScheduledAuctionDto;
import com.example.backend.auction.domain.item.AuctionImgRepository;

import com.example.backend.category.CategoryRepository;
import com.example.backend.category.Category;
import com.example.backend.auction.domain.auction.dto.FilterOptionsDto;
import com.example.backend.auction.domain.auction.dto.CategoryDto;
import com.example.backend.auction.domain.item.AuctionItemsRepository;

@Service
public class ActiveItemsService {

    private final AuctionRepository auctionRepo;
    private final AuctionImgRepository imgRepo;
    private final AuctionItemsRepository itemRepo;
    private final CategoryRepository categoryRepo;

    public ActiveItemsService(AuctionRepository auctionRepo, AuctionImgRepository imgRepo,
            AuctionItemsRepository itemRepo, CategoryRepository categoryRepo) {
        this.auctionRepo = auctionRepo;
        this.imgRepo = imgRepo;
        this.itemRepo = itemRepo;
        this.categoryRepo = categoryRepo;
    }

    @Transactional(readOnly = true)
    public Page<AuctionDto> listActiveAuctions(
            Pageable pageable,
            List<String> categories,
            List<String> locations,
            String from,
            String to,
            Boolean negotiated) {
        if (pageable.getSort().isUnsorted()) {
            pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(),
                    Sort.by(Sort.Direction.DESC, "endDate"));
        }

        List<String> safeCategories = (categories != null && !categories.isEmpty()) ? categories : null;
        List<String> safeLocations = (locations != null && !locations.isEmpty()) ? locations : null;

        boolean hasFilter = safeCategories != null || safeLocations != null || from != null || to != null
                || negotiated != null;

        if (hasFilter) {
            return auctionRepo.findActiveAuctionsFiltered(
                    safeCategories,
                    safeLocations,
                    from,
                    to,
                    negotiated,
                    pageable);
        }

        return auctionRepo.findActiveAuctions("Open", pageable);
    }

    @Transactional(readOnly = true)
    public Page<EndedAuctionDto> listEndedAndClosedAuctions(Pageable pageable) {
        return auctionRepo.findEndedAuctions(List.of("Ended", "Closed"), pageable);
    }

    @Transactional(readOnly = true)
    public Page<ScheduledAuctionDto> listScheduledAuctions(Pageable pageable) {
        return auctionRepo.findScheduledAuctions(pageable);
    }

    @Transactional(readOnly = true)
    public AuctionDetailDto getAuctionDetailBySlug(String slug) {
        AuctionDetailProjection proj = auctionRepo.findDetailBySlug(slug)
                .orElseThrow(
                        () -> new RuntimeException("Không tìm thấy sản phẩm hoặc phiên đấu giá với slug: " + slug));

        List<String> images = imgRepo.findAllImgUrlsByItemId(proj.getItemId());

        return new AuctionDetailDto(
                proj.getAuctionId(),
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
                proj.getSellerName(),
                images);
    }

    @Transactional(readOnly = true)
    public FilterOptionsDto getFilterOptions() {
        List<String> locations = itemRepo.findDistinctLocations();
        List<Category> activeCats = categoryRepo.findActiveCategories();

        List<CategoryDto> categoryDtos = activeCats.stream()
                .map(c -> new CategoryDto(c.getCategoryId(), c.getCategoryName()))
                .toList();

        return new FilterOptionsDto(categoryDtos, locations);
    }

    @Transactional(readOnly = true)
    public Page<AuctionDto> searchAuctions(String keyword, Pageable pageable) {
        if (keyword == null || keyword.trim().isEmpty()) {
            return Page.empty(pageable);
        }

        if (pageable.getSort().isUnsorted()) {
            pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(),
                    Sort.by(Sort.Direction.DESC, "startDate"));
        }
        return auctionRepo.searchAuctionsAdvanced(keyword.trim(), null, null, null, pageable);
    }

    @Transactional(readOnly = true)
    public Page<AuctionDto> searchAuctionsAdvanced(String keyword, Double minPrice, Double maxPrice, Integer ownerId,
            Pageable pageable) {
        if (keyword == null)
            keyword = "";

        if (pageable.getSort().isUnsorted()) {
            pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(),
                    Sort.by("currentPrice").ascending());
        }

        return auctionRepo.searchAuctionsAdvanced(keyword.trim(), minPrice, maxPrice, ownerId, pageable);
    }
}