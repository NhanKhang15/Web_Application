package com.example.backend.auction.controller;

import com.example.backend.auction.domain.auction.Auction;
import com.example.backend.auction.domain.auction.dto.CreateAuctionRequest;
import com.example.backend.auction.service.AuctionWriteService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/seller") // Đường dẫn riêng cho Seller
@CrossOrigin
public class AuctionSellerController {

    private final AuctionWriteService writeService;

    public AuctionSellerController(AuctionWriteService writeService) {
        this.writeService = writeService;
    }

    /**
     * POST /api/seller/create-auction
     * Upload Multipart: gồm 1 chuỗi JSON 'data' và mảng file 'files'
     */
    @PostMapping(value = "/create-auction", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> createAuction(
            @RequestPart("data") String dataJson, // Nhận JSON dưới dạng String để parse thủ công (tránh lỗi
                                                  // content-type)
            @RequestPart(value = "files", required = false) MultipartFile[] files) {
        try {
            // Parse JSON String sang Object
            ObjectMapper mapper = new ObjectMapper();
            mapper.registerModule(new JavaTimeModule()); // Hỗ trợ LocalDateTime
            CreateAuctionRequest request = mapper.readValue(dataJson, CreateAuctionRequest.class);

            Auction createdAuction = writeService.createAuction(request, files);
            return ResponseEntity.ok(createdAuction);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi tạo đấu giá: " + e.getMessage());
        }
    }
}
