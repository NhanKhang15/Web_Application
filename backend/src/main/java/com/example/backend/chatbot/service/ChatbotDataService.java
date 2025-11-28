package com.example.backend.chatbot.service;

import com.example.backend.auction.domain.auction.dto.AuctionDto;
import com.example.backend.auction.service.ActiveItemsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
public class ChatbotDataService {

    @Autowired
    private ActiveItemsService activeItemsService;

    // 👇 Thêm tham số userId
    public String getAuctionContext(String keyword, Double minPrice, Double maxPrice, Integer userId, boolean isMyItem) {
        Pageable pageable = PageRequest.of(0, 5);
        Integer ownerIdFilter = isMyItem ? userId : null;
        Page<AuctionDto> resultPage = activeItemsService.searchAuctionsAdvanced(keyword, minPrice, maxPrice, ownerIdFilter, pageable);
        List<AuctionDto> auctions = resultPage.getContent();

        if (auctions.isEmpty()) {
            if (isMyItem) return "Bạn chưa đăng bán sản phẩm nào (hoặc sản phẩm chưa được duyệt).";
            return "Không tìm thấy sản phẩm nào khớp với yêu cầu.";
        }

        AtomicInteger counter = new AtomicInteger(1);
        return auctions.stream()
                .map(dto -> formatForAI(dto, counter.getAndIncrement(), userId))
                .collect(Collectors.joining("\n\n"));
    }

    private String formatForAI(AuctionDto dto, int index, Integer userId) {
        LocalDateTime now = LocalDateTime.now();

        // --- 1. XỬ LÝ THỜI GIAN ---
        long secondsLeft = dto.getEndDate() != null ? Duration.between(now, dto.getEndDate()).getSeconds() : 0;
        String timeString = (secondsLeft <= 0) ? "ĐÃ KẾT THÚC" : (secondsLeft / 3600) + " giờ";

        // --- 2. KIỂM TRA CHỦ SỞ HỮU (Chỉ check khi đã login) ---
        boolean isOwner = false;
        if (userId != null && dto.getSellerId() != null) {
            isOwner = dto.getSellerId().equals(userId);
        }

        // === TRƯỜNG HỢP 1: LÀ NGƯỜI BÁN ===
        if (isOwner) {
            String growth = "➖ Chưa tăng";
            if (dto.getCurrentPrice().compareTo(dto.getStartingPrice()) > 0) {
                growth = "📈 Đang tăng giá";
            }

            return String.format(
                    "📦 BÁO CÁO SẢN PHẨM #%d (CỦA BẠN):\n" +
                            "- Tên: %s\n" +
                            "- Giá hiện tại: %,.0f VNĐ\n" +
                            "- Giá khởi điểm: %,.0f VNĐ\n" +
                            "- Tình trạng: %s\n" +
                            "- Thời gian còn lại: %s",
                    index,
                    dto.getTitle(),
                    dto.getCurrentPrice(),
                    dto.getStartingPrice(),
                    growth,
                    timeString
            );
        }

        // === TRƯỜNG HỢP 2: LÀ KHÁCH MUA (HOẶC CHƯA LOGIN) ===
        // 👇 Đưa đoạn này RA NGOÀI if (userId != null) để ai cũng xem được
        String urgencyTag = (secondsLeft > 0 && secondsLeft < 1800) ? " [GẤP - SẮP ĐÓNG]" : "";
        BigDecimal currentPrice = dto.getCurrentPrice();
        BigDecimal minStep = dto.getMinStep() != null ? dto.getMinStep() : BigDecimal.ZERO;
        BigDecimal nextValidBid = currentPrice.add(minStep);

        String buyNowStr = "Không hỗ trợ";
        if (dto.getBuyNowPrice() != null && dto.getBuyNowPrice().compareTo(BigDecimal.ZERO) > 0) {
            buyNowStr = String.format("%,.0f VNĐ (Có thể chốt luôn)", dto.getBuyNowPrice());
        }

        return String.format(
                "PHIÊN ĐẤU GIÁ #%d %s:\n" +
                        "- Sản phẩm: %s\n" +
                        "- Giá hiện tại: %,.0f VNĐ\n" +
                        "- 🔴 GIÁ CẦN ĐẶT TIẾP: %,.0f VNĐ\n" +
                        "- ⚡ Mua ngay: %s\n" +
                        "- ⏳ Thời gian: %s %s\n" +
                        "- Link: /auctions/%s",
                index, urgencyTag,
                dto.getTitle(),
                currentPrice,
                nextValidBid,
                buyNowStr,
                timeString, urgencyTag,
                dto.getSlug()
        );
    }
}