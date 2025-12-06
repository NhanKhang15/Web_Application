package com.example.backend.chatbot.service;

import com.example.backend.auction.domain.auction.Auction;
import com.example.backend.auction.domain.auction.AuctionRepository;
import com.example.backend.auction.domain.auction.dto.AuctionDto;
import com.example.backend.auction.domain.auction.dto.BidResult;
import com.example.backend.auction.service.ActiveItemsService;
import com.example.backend.auction.service.BidService;
import com.example.backend.security.auth.User;
import com.example.backend.security.auth.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.stream.Collectors;

@Service
public class ChatbotDataService {

    @Autowired
    private ActiveItemsService activeItemsService;

    @Autowired
    private BidService bidService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuctionRepository auctionRepository;

    // Cache kết quả search gần nhất cho mỗi user (đơn giản hóa, trong thực tế nên
    // dùng Redis)
    private java.util.Map<Integer, List<AuctionDto>> lastSearchResults = new java.util.concurrent.ConcurrentHashMap<>();

    // 👇 Thêm tham số userId
    public String getAuctionContext(String keyword, Double minPrice, Double maxPrice, Integer userId,
            boolean isMyItem) {
        Pageable pageable = PageRequest.of(0, 5);
        Integer ownerIdFilter = isMyItem ? userId : null;
        Page<AuctionDto> resultPage = activeItemsService.searchAuctionsAdvanced(keyword, minPrice, maxPrice,
                ownerIdFilter, pageable);
        List<AuctionDto> auctions = resultPage.getContent();

        // Lưu kết quả để user có thể chọn theo số thứ tự
        if (userId != null) {
            lastSearchResults.put(userId, auctions);
        }

        if (auctions.isEmpty()) {
            if (isMyItem)
                return "Bạn chưa đăng bán sản phẩm nào (hoặc sản phẩm chưa được duyệt).";
            return "Không tìm thấy sản phẩm nào khớp với yêu cầu.";
        }

        AtomicInteger counter = new AtomicInteger(1);
        return auctions.stream()
                .map(dto -> formatForAI(dto, counter.getAndIncrement(), userId))
                .collect(Collectors.joining("\n\n"));
    }

    /**
     * Lấy thông tin auction theo số thứ tự từ kết quả search gần nhất
     */
    public AuctionDto getAuctionByIndex(Integer userId, int index) {
        List<AuctionDto> cached = lastSearchResults.get(userId);
        if (cached == null || index < 1 || index > cached.size()) {
            return null;
        }
        return cached.get(index - 1); // index 1-based
    }

    /**
     * Kiểm tra user đã xác thực email chưa
     */
    public boolean isEmailVerified(Integer userId) {
        if (userId == null)
            return false;
        Optional<User> userOpt = userRepository.findById(userId);
        return userOpt.map(User::isEmailVerified).orElse(false);
    }

    /**
     * Đặt giá cho user
     * 
     * @return Kết quả dạng text để AI phản hồi
     */
    public String placeBidForUser(Integer userId, Integer auctionId, BigDecimal amount) {
        if (userId == null) {
            return "LỖI: Bạn cần đăng nhập để đặt giá.";
        }

        // Kiểm tra email verified
        if (!isEmailVerified(userId)) {
            return "LỖI_EMAIL: Bạn cần xác thực email trước khi đặt giá. Vào Hồ sơ > Xác thực Email.";
        }

        try {
            BidResult result = bidService.placeBid(auctionId, userId, amount);
            if (result.isSuccess()) {
                return String.format("THÀNH CÔNG: Đã đặt giá %,.0f VNĐ! Bạn hiện là người đặt giá cao nhất.", amount);
            } else {
                // Dịch các lỗi phổ biến sang tiếng Việt
                String errorMsg = translateError(result.getMessage());
                return "LỖI: " + errorMsg;
            }
        } catch (Exception e) {
            // Dịch các exception message sang tiếng Việt
            String errorMsg = translateError(e.getMessage());
            return "LỖI: " + errorMsg;
        }
    }

    /**
     * Dịch các lỗi phổ biến sang tiếng Việt
     */
    private String translateError(String englishError) {
        if (englishError == null)
            return "Đã xảy ra lỗi không xác định.";

        String lower = englishError.toLowerCase();

        if (lower.contains("wallet not found")) {
            return "Bạn chưa có ví. Vui lòng vào Hồ sơ > Ví của bạn để tạo ví trước khi đặt giá.";
        }
        if (lower.contains("insufficient") || lower.contains("not enough")) {
            return "Số dư ví không đủ. Vui lòng nạp thêm tiền vào ví để đặt giá.";
        }
        if (lower.contains("auction not found")) {
            return "Không tìm thấy phiên đấu giá này.";
        }
        if (lower.contains("auction is not open") || lower.contains("has ended")) {
            return "Phiên đấu giá đã kết thúc hoặc chưa mở.";
        }
        if (lower.contains("bid too low") || lower.contains("minimum bid")) {
            return "Giá đặt quá thấp. Vui lòng đặt cao hơn giá hiện tại + bước giá.";
        }
        if (lower.contains("user not found")) {
            return "Không tìm thấy thông tin người dùng.";
        }

        // Nếu không match, trả về nguyên bản
        return englishError;
    }

    /**
     * Lấy thông tin auction từ slug
     */
    public Auction getAuctionBySlug(String slug) {
        return auctionRepository.findByItem_Slug(slug).orElse(null);
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
                    timeString);
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
                dto.getSlug());
    }
}