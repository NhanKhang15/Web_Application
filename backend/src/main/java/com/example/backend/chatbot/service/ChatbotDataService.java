package com.example.backend.chatbot.service;

import com.example.backend.auction.domain.auction.Auction;
import com.example.backend.auction.domain.auction.AuctionRepository;
import com.example.backend.auction.domain.auction.dto.AuctionDto;
import com.example.backend.auction.domain.auction.dto.BidResult;
import com.example.backend.auction.service.ActiveItemsService;
import com.example.backend.auction.service.BidService;
import com.example.backend.security.auth.User;
import com.example.backend.security.auth.UserRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
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

@Slf4j
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

    @Autowired
    private CacheManager cacheManager;

    private static final String CACHE_NAME = "auctionSearchCache";

    /**
     * Get or create cache for storing search results
     */
    private Cache getSearchCache() {
        return cacheManager.getCache(CACHE_NAME);
    }

    /**
     * Store search results in cache with user-specific key
     */
    private void cacheSearchResults(Integer userId, List<AuctionDto> results) {
        Cache cache = getSearchCache();
        if (cache != null && userId != null) {
            String cacheKey = "user_" + userId;
            cache.put(cacheKey, results);
            log.debug("Cached {} search results for user {}", results.size(), userId);
        }
    }

    /**
     * Get cached search results for a user
     */
    @SuppressWarnings("unchecked")
    private List<AuctionDto> getCachedSearchResults(Integer userId) {
        Cache cache = getSearchCache();
        if (cache != null && userId != null) {
            String cacheKey = "user_" + userId;
            Cache.ValueWrapper wrapper = cache.get(cacheKey);
            if (wrapper != null) {
                log.debug("Cache hit for user {}", userId);
                return (List<AuctionDto>) wrapper.get();
            }
            log.debug("Cache miss for user {}", userId);
        }
        return null;
    }

    public String getAuctionContext(String keyword, Double minPrice, Double maxPrice, Integer userId,
            boolean isMyItem) {
        log.info("Searching auctions - keyword: '{}', price: {}-{}, userId: {}, isMyItem: {}",
                keyword, minPrice, maxPrice, userId, isMyItem);

        Pageable pageable = PageRequest.of(0, 5);
        Integer ownerIdFilter = isMyItem ? userId : null;
        Page<AuctionDto> resultPage = activeItemsService.searchAuctionsAdvanced(keyword, minPrice, maxPrice,
                ownerIdFilter, pageable);
        List<AuctionDto> auctions = resultPage.getContent();

        log.info("Found {} auctions matching criteria", auctions.size());

        // Store results in cache for user to reference by index
        if (userId != null) {
            cacheSearchResults(userId, auctions);
        }

        if (auctions.isEmpty()) {
            if (isMyItem) {
                log.debug("No products found for seller userId: {}", userId);
                return "Bạn chưa đăng bán sản phẩm nào (hoặc sản phẩm chưa được duyệt).";
            }
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
        List<AuctionDto> cached = getCachedSearchResults(userId);
        if (cached == null || index < 1 || index > cached.size()) {
            log.warn("Auction index {} not found in cache for user {}", index, userId);
            return null;
        }
        log.debug("Retrieved auction at index {} from cache for user {}", index, userId);
        return cached.get(index - 1); // index 1-based
    }

    /**
     * Kiểm tra user đã xác thực email chưa
     */
    public boolean isEmailVerified(Integer userId) {
        if (userId == null) {
            log.debug("Cannot check email verification: userId is null");
            return false;
        }
        Optional<User> userOpt = userRepository.findById(userId);
        boolean verified = userOpt.map(User::isEmailVerified).orElse(false);
        log.debug("Email verification status for user {}: {}", userId, verified);
        return verified;
    }

    /**
     * Đặt giá cho user
     * 
     * @return Kết quả dạng text để AI phản hồi
     */
    public String placeBidForUser(Integer userId, Integer auctionId, BigDecimal amount) {
        log.info("Placing bid - userId: {}, auctionId: {}, amount: {}", userId, auctionId, amount);

        if (userId == null) {
            log.warn("Bid rejected: user not logged in");
            return "LỖI: Bạn cần đăng nhập để đặt giá.";
        }

        // Kiểm tra email verified
        if (!isEmailVerified(userId)) {
            log.warn("Bid rejected: email not verified for user {}", userId);
            return "LỖI_EMAIL: Bạn cần xác thực email trước khi đặt giá. Vào Hồ sơ > Xác thực Email.";
        }

        try {
            BidResult result = bidService.placeBid(auctionId, userId, amount);
            log.info("BidService returned - success: {}, message: {}", result.isSuccess(), result.getMessage());

            if (result.isSuccess()) {
                log.info("Bid placed successfully - userId: {}, auctionId: {}, amount: {}",
                        userId, auctionId, amount);
                return String.format("THÀNH CÔNG: Đã đặt giá %,.0f VNĐ! Bạn hiện là người đặt giá cao nhất.", amount);
            } else {
                // Dịch các lỗi phổ biến sang tiếng Việt
                String errorMsg = translateError(result.getMessage());
                log.warn("Bid failed for user {}: {}", userId, errorMsg);
                return "LỖI: " + errorMsg;
            }
        } catch (Exception e) {
            // Dịch các exception message sang tiếng Việt
            String errorMsg = translateError(e.getMessage());
            log.error("Bid exception for user {} on auction {}: {}", userId, auctionId, e.getMessage(), e);
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

        // Lỗi tự đấu giá sản phẩm của mình
        if (lower.contains("chính mình") || lower.contains("own product") ||
                lower.contains("own auction") || lower.contains("bid on your own")) {
            return "Bạn không thể đặt giá cho sản phẩm của chính mình.";
        }

        if (lower.contains("wallet not found")) {
            return "Bạn chưa có ví. Vui lòng vào Hồ sơ > Ví của bạn để tạo ví trước khi đặt giá.";
        }
        if (lower.contains("insufficient") || lower.contains("not enough") || lower.contains("không đủ")) {
            return "Số dư ví không đủ. Vui lòng nạp thêm tiền vào ví để đặt giá.";
        }
        if (lower.contains("auction not found")) {
            return "Không tìm thấy phiên đấu giá này.";
        }
        if (lower.contains("auction is not open") || lower.contains("has ended") || lower.contains("đã kết thúc")) {
            return "Phiên đấu giá đã kết thúc hoặc chưa mở.";
        }
        if (lower.contains("bid too low") || lower.contains("minimum bid") || lower.contains("quá thấp")) {
            return "Giá đặt quá thấp. Vui lòng đặt cao hơn giá hiện tại + bước giá.";
        }
        if (lower.contains("user not found")) {
            return "Không tìm thấy thông tin người dùng.";
        }
        if (lower.contains("could not execute statement") || lower.contains("insert into bids")) {
            // SQL error - try to extract the actual error message
            if (englishError.contains("[Lỗi:")) {
                int start = englishError.indexOf("[Lỗi:") + 5;
                int end = englishError.indexOf("]", start);
                if (end > start) {
                    String extracted = englishError.substring(start, end).trim();
                    return extracted;
                }
            }
            return "Không thể đặt giá. Vui lòng thử lại sau.";
        }

        // Nếu không match, trả về nguyên bản nhưng loại bỏ phần technical
        if (englishError.contains("[") && englishError.contains("]")) {
            // Try to extract user-friendly message
            int start = englishError.indexOf("[Lỗi:");
            if (start != -1) {
                int end = englishError.indexOf("]", start);
                if (end > start) {
                    return englishError.substring(start + 5, end).trim();
                }
            }
        }

        return englishError;
    }

    /**
     * Lấy thông tin auction từ slug
     */
    public Auction getAuctionBySlug(String slug) {
        log.debug("Looking up auction by slug: {}", slug);
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