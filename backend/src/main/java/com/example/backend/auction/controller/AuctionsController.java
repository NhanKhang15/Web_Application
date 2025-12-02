package com.example.backend.auction.controller;

import com.example.backend.auction.domain.auction.dto.AuctionDetailDto;
import com.example.backend.auction.domain.auction.dto.FilterOptionsDto;
import com.example.backend.auction.service.ActiveItemsService;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest; // Re-add PageRequest
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.auction.domain.auction.dto.AuctionDto;
import com.example.backend.auction.domain.auction.dto.AuctionDetailDto;
import com.example.backend.auction.service.ActiveItemsService;

import java.util.List;

@RestController
@RequestMapping("/api/auctions")
@CrossOrigin
public class AuctionsController {

    private final ActiveItemsService service;

    public AuctionsController(ActiveItemsService service) {
        this.service = service;
    }

    // API 1: Xem danh sách hoạt động
    @GetMapping("/active")
    public ResponseEntity<Page<AuctionDto>> getActiveList(
            Pageable pageable,
            @RequestParam(required = false) List<String> category, // Cần List<String>
            @RequestParam(required = false) List<String> location, // Cần List<String>
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(required = false) Boolean negotiated
    ) {
        return ResponseEntity.ok(service.listActiveAuctions(pageable, category, location, from, to, negotiated));
    }

    // API 2: Xem danh sách đả kết thúc
    @GetMapping("/ended")
    public ResponseEntity<Page<AuctionDto>> getEndedList(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        // Giới hạn size để tránh quá tải (tùy chọn)
        int pageSize = Math.min(size, 50);
        return ResponseEntity.ok(service.listEndedAuctions(PageRequest.of(page, pageSize)));
    }

    // API 3: Xem danh sách được đóng
    @GetMapping("/closed")
    public ResponseEntity<Page<AuctionDto>> getClosedList(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        // Giới hạn size để tránh quá tải (tùy chọn)
        int pageSize = Math.min(size, 50);
        return ResponseEntity.ok(service.listClosedAuctions(PageRequest.of(page, pageSize)));
    }

    // API 4: Xem danh sách đang chờ
    @GetMapping("/scheduled")
    public ResponseEntity<Page<AuctionDto>> getScheduledList(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        // Giới hạn size để tránh quá tải (tùy chọn)
        int pageSize = Math.min(size, 50);
        return ResponseEntity.ok(service.listScheduledAuctions(PageRequest.of(page, pageSize)));
    }

    // API 5: Xem chi tiết
    @GetMapping("/detail/{slug}")
    public ResponseEntity<AuctionDetailDto> getDetail(@PathVariable String slug) {
        return ResponseEntity.ok(service.getAuctionDetailBySlug(slug));
    }

    @GetMapping("/search")
    public ResponseEntity<Page<AuctionDto>> searchAuctions(@RequestParam String keyword, Pageable pageable) {
        return ResponseEntity.ok(service.searchAuctions(keyword, pageable));
    }

    @GetMapping("/filters")
    public ResponseEntity<FilterOptionsDto> getFilters() {
        return ResponseEntity.ok(service.getFilterOptions());
    }
}
