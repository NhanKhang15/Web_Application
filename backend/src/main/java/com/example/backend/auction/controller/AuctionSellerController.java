package com.example.backend.auction.controller;

import com.example.backend.auction.domain.auction.Auction;
import com.example.backend.auction.domain.auction.AuctionRepository;
import com.example.backend.auction.domain.auction.dto.AuctionDto;
import com.example.backend.auction.domain.auction.dto.CreateAuctionRequest;
import com.example.backend.auction.service.AuctionWriteService;
import com.example.backend.security.auth.User;
import com.example.backend.security.auth.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/seller")
@CrossOrigin
public class AuctionSellerController {

    private final AuctionWriteService writeService;
    private final UserRepository userRepository;
    private final AuctionRepository auctionRepository;

    public AuctionSellerController(AuctionWriteService writeService, UserRepository userRepository,
            AuctionRepository auctionRepository) {
        this.writeService = writeService;
        this.userRepository = userRepository;
        this.auctionRepository = auctionRepository;
    }

    /**
     * GET /api/seller/my-auctions
     * Get all auctions for the authenticated seller with optional status filter
     * 
     * @param status Optional filter: Open, Scheduled, Ended, Closed (null = all)
     */
    @GetMapping("/my-auctions")
    public ResponseEntity<?> getMyAuctions(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size,
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        try {
            Integer sellerId = null;

            if (userDetails != null) {
                User seller = userRepository.findByUsername(userDetails.getUsername()).orElse(null);
                if (seller != null) {
                    sellerId = seller.getUserId();
                }
            }

            if (sellerId == null) {
                return ResponseEntity.status(401).body("Vui lòng đăng nhập để xem danh sách đấu giá của bạn.");
            }

            // Validate status if provided
            if (status != null && !status.isEmpty()) {
                String normalizedStatus = normalizeStatus(status);
                if (normalizedStatus == null) {
                    return ResponseEntity.badRequest()
                            .body("Trạng thái không hợp lệ. Sử dụng: Open, Scheduled, Ended, Closed");
                }
                status = normalizedStatus;
            } else {
                status = null; // All statuses
            }

            Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
            Page<AuctionDto> auctions = auctionRepository.findAuctionsBySellerId(sellerId, status, pageable);

            return ResponseEntity.ok(auctions);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi lấy danh sách đấu giá: " + e.getMessage());
        }
    }

    /**
     * GET /api/seller/my-auctions/all
     * Get all auctions for the authenticated seller (no pagination, for small
     * lists)
     */
    @GetMapping("/my-auctions/all")
    public ResponseEntity<?> getAllMyAuctions(
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        try {
            Integer sellerId = null;

            if (userDetails != null) {
                User seller = userRepository.findByUsername(userDetails.getUsername()).orElse(null);
                if (seller != null) {
                    sellerId = seller.getUserId();
                }
            }

            if (sellerId == null) {
                return ResponseEntity.status(401).body("Vui lòng đăng nhập để xem danh sách đấu giá của bạn.");
            }

            List<AuctionDto> auctions = auctionRepository.findAllAuctionsBySellerId(sellerId);
            return ResponseEntity.ok(auctions);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi lấy danh sách đấu giá: " + e.getMessage());
        }
    }

    /**
     * Normalize status string to database enum value
     */
    private String normalizeStatus(String status) {
        if (status == null)
            return null;
        switch (status.toLowerCase()) {
            case "open":
            case "active":
                return "Open";
            case "scheduled":
                return "Scheduled";
            case "ended":
                return "Ended";
            case "closed":
                return "Closed";
            case "cancelled":
                return "Cancelled";
            default:
                return null;
        }
    }

    /**
     * POST /api/seller/create-auction
     * Upload Multipart: JSON 'data' và mảng file 'files'
     */
    @PostMapping(value = "/create-auction", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createAuction(
            @RequestPart("data") String dataJson,
            @RequestPart(value = "files", required = false) MultipartFile[] files,
            @AuthenticationPrincipal org.springframework.security.core.userdetails.UserDetails userDetails) {
        try {
            // Parse JSON
            ObjectMapper mapper = new ObjectMapper();
            mapper.registerModule(new JavaTimeModule());
            CreateAuctionRequest request = mapper.readValue(dataJson, CreateAuctionRequest.class);

            // Get sellerId from authenticated user
            Integer sellerId = null;
            User seller = null;

            if (userDetails != null) {
                // User is authenticated - get their ID
                seller = userRepository.findByUsername(userDetails.getUsername()).orElse(null);
                if (seller != null) {
                    sellerId = seller.getUserId();
                }
            }

            if (sellerId == null) {
                // For testing without authentication, use default seller ID
                // TODO: In production, require authentication
                sellerId = 1; // Default for testing
                seller = userRepository.findById(sellerId).orElse(null);
            }

            // Check email verification
            if (seller == null || !seller.isEmailVerified()) {
                return ResponseEntity.status(403)
                        .body("Email chưa được xác thực. Vui lòng xác thực email trước khi đăng đấu giá.");
            }

            // Set sellerId
            request.setSellerId(sellerId);

            Auction createdAuction = writeService.createAuction(request, files);
            return ResponseEntity.ok(createdAuction);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi tạo đấu giá: " + e.getMessage());
        }
    }
}
