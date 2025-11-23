package com.example.backend.auction.controller;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
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

@RestController
@RequestMapping("/api/auctions") // Đường dẫn chung cho việc xem
@CrossOrigin
public class AuctionsController {

    private final ActiveItemsService service;

    public AuctionsController(ActiveItemsService service) {
        this.service = service;
    }

    // API 1: Xem danh sách hoạt động
    @GetMapping("/active")
    public ResponseEntity<Page<AuctionDto>> getActiveList(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(service.listActiveAuctions(PageRequest.of(page, size)));
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
}
