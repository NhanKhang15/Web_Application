package com.example.backend.auction.controller;

import com.example.backend.auction.domain.auction.dto.ActiveAuctionDto;
import com.example.backend.auction.domain.auction.dto.AuctionDetailDto;
import com.example.backend.auction.domain.auction.dto.FilterOptionsDto;
import com.example.backend.auction.service.ActiveItemsService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auctions") // Đường dẫn chung cho việc xem
@CrossOrigin
public class AuctionsController {

    private final ActiveItemsService service; // Tận dụng lại Service cũ của bạn

    public AuctionsController(ActiveItemsService service) {
        this.service = service;
    }

    // API 1: Xem danh sách
    @GetMapping("/active")
    public ResponseEntity<Page<ActiveAuctionDto>> getActiveList(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Integer categoryId,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to) {
        return ResponseEntity.ok(service.listActiveAuctions(categoryId, from, to, PageRequest.of(page, size)));
    }

    // API 2: Xem chi tiết
    @GetMapping("/detail/{slug}")
    public ResponseEntity<AuctionDetailDto> getDetail(@PathVariable String slug) {
        return ResponseEntity.ok(service.getAuctionDetailBySlug(slug));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<ActiveAuctionDto>> searchAuctions(@RequestParam String keyword,
                                                                 @RequestParam(defaultValue = "0") int page,
                                                                 @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(service.searchAuctions(keyword, PageRequest.of(page, size)));
    }

    @GetMapping("/filters")
    public ResponseEntity<FilterOptionsDto> getFilters() {
        return ResponseEntity.ok(service.getFilterOptions());
    }
}
