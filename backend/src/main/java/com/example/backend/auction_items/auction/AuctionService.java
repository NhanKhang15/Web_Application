package com.example.backend.auction_items.auction;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AuctionService {

    private final AuctionRepository auctionRepo;

    public AuctionService(AuctionRepository auctionRepo) {
        this.auctionRepo = auctionRepo;
    }

    // --- Logic Lấy Dữ Liệu ---

    public List<AuctionDto> getAllAuctions() {
        return auctionRepo.findAll()
                .stream()
                .map(this::convertToDto) // Chuyển Entity -> DTO
                .collect(Collectors.toList());
    }

    public Optional<AuctionDto> getAuctionById(Integer auctionId) {
        return auctionRepo.findById(auctionId)
                .map(this::convertToDto); // Chuyển Entity -> DTO
    }

    public Optional<AuctionDto> getAuctionByItemId(Integer itemId) {
        return auctionRepo.findByItemId(itemId)
                .map(this::convertToDto); // Chuyển Entity -> DTO
    }

    // --- Logic Nghiệp Vụ (Tạo/Sửa) ---

    @Transactional
    public AuctionDto createAuction(CreateAuctionRequest request) {
        // 1. Validate (Toàn bộ logic chuyển từ Controller sang đây)
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new RuntimeException("End date must be after start date");
        }
        if (request.getStartingPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Starting price must be greater than 0");
        }

        // 2. Chuyển DTO -> Entity
        Auction auction = new Auction();
        auction.setItemId(request.getItemId());
        auction.setStartingPrice(request.getStartingPrice());
        auction.setMinStep(request.getMinStep() != null ? request.getMinStep() : new BigDecimal("100"));
        auction.setCurrentPrice(request.getStartingPrice()); // Logic đặt giá hiện tại
        auction.setReservePrice(request.getReservePrice());
        auction.setBuyNowPrice(request.getBuyNowPrice());
        auction.setStatus(request.getStatus() != null
                ? Auction.AuctionStatus.valueOf(request.getStatus())
                : Auction.AuctionStatus.Scheduled);
        auction.setStartDate(request.getStartDate());
        auction.setEndDate(request.getEndDate());
        // (Không cần setCreatedAt/UpdatedAt, @PrePersist sẽ tự làm)

        // 3. Lưu vào DB
        Auction saved = auctionRepo.save(auction);

        // 4. Trả về DTO
        return convertToDto(saved);
    }

    @Transactional
    public AuctionDto updateAuctionStatus(Integer auctionId, String status) {
        // 1. Validate Status (nên làm)
        Auction.AuctionStatus newStatus;
        try {
            newStatus = Auction.AuctionStatus.valueOf(status);
        } catch (IllegalArgumentException e) {
            throw new RuntimeException("Invalid status value: " + status);
        }

        // 2. Tìm và Cập nhật
        Auction auction = auctionRepo.findById(auctionId)
                .orElseThrow(() -> new RuntimeException("Auction not found"));

        // (Bạn có thể thêm logic kiểm tra chuyển đổi trạng thái ở đây)
        // Ví dụ: if (auction.getStatus() == Ended) ...

        auction.setStatus(newStatus);
        // (Không cần setUpdatedAt, @PreUpdate sẽ tự làm)

        Auction updated = auctionRepo.save(auction);
        return convertToDto(updated);
    }


    // --- Hàm Helper (Tiện ích) ---

    // Hàm này dùng để chuyển Entity (Database) -> DTO (API Response)
    private AuctionDto convertToDto(Auction auction) {
        AuctionDto dto = new AuctionDto();
        dto.setAuctionId(auction.getAuctionId());
        dto.setItemId(auction.getItemId());
        dto.setStartingPrice(auction.getStartingPrice());
        dto.setCurrentPrice(auction.getCurrentPrice());
        dto.setMinStep(auction.getMinStep());
        dto.setReservePrice(auction.getReservePrice());
        dto.setBuyNowPrice(auction.getBuyNowPrice());
        dto.setStatus(auction.getStatus().toString());
        dto.setStartDate(auction.getStartDate());
        dto.setEndDate(auction.getEndDate());
        return dto;
    }
}