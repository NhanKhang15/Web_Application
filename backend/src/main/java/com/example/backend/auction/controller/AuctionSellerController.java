package com.example.backend.auction.controller;

import com.example.backend.auction.domain.auction.Auction;
import com.example.backend.auction.domain.auction.dto.CreateAuctionRequest;
import com.example.backend.auction.service.AuctionWriteService;
import com.example.backend.security.auth.User;
import com.example.backend.security.auth.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/seller")
@CrossOrigin
public class AuctionSellerController {

    private final AuctionWriteService writeService;
    private final UserRepository userRepository;

    public AuctionSellerController(AuctionWriteService writeService, UserRepository userRepository) {
        this.writeService = writeService;
        this.userRepository = userRepository;
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

            if (userDetails != null) {
                // User is authenticated - get their ID
                sellerId = getUserIdFromUsername(userDetails.getUsername());
            }

            if (sellerId == null) {
                // For testing without authentication, use default seller ID
                // TODO: In production, require authentication
                sellerId = 1; // Default for testing
            }

            // Set sellerId
            request.setSellerId(sellerId);

            Auction createdAuction = writeService.createAuction(request, files);
            return ResponseEntity.ok(createdAuction);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi tạo đấu giá: " + e.getMessage());
        }
    }

    /**
     * Get userId from username
     */
    private Integer getUserIdFromUsername(String username) {
        if (username == null) {
            return null;
        }
        return userRepository.findByUsername(username)
                .map(User::getUserId)
                .orElse(null);
    }
}
