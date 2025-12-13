package com.example.backend.chatbot;

import com.example.backend.auction.domain.auction.Auction;
import com.example.backend.auction.domain.auction.AuctionRepository;
import com.example.backend.auction.domain.auction.dto.AuctionDto;
import com.example.backend.auction.domain.auction.dto.BidResult;
import com.example.backend.auction.service.ActiveItemsService;
import com.example.backend.auction.service.BidService;
import com.example.backend.chatbot.service.ChatbotDataService;
import com.example.backend.security.auth.User;
import com.example.backend.security.auth.UserRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.cache.Cache;
import org.springframework.cache.CacheManager;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

/**
 * Unit tests for ChatbotDataService
 */
@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class ChatbotDataServiceTest {

    @Mock
    private ActiveItemsService activeItemsService;

    @Mock
    private BidService bidService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuctionRepository auctionRepository;

    @Mock
    private CacheManager cacheManager;

    @Mock
    private Cache cache;

    @InjectMocks
    private ChatbotDataService chatbotDataService;

    private AuctionDto createSampleAuction() {
        AuctionDto sampleAuction = mock(AuctionDto.class);
        when(sampleAuction.getAuctionId()).thenReturn(1);
        when(sampleAuction.getTitle()).thenReturn("Test Laptop");
        when(sampleAuction.getSlug()).thenReturn("test-laptop");
        when(sampleAuction.getCurrentPrice()).thenReturn(BigDecimal.valueOf(1000000));
        when(sampleAuction.getStartingPrice()).thenReturn(BigDecimal.valueOf(500000));
        when(sampleAuction.getMinStep()).thenReturn(BigDecimal.valueOf(50000));
        when(sampleAuction.getEndDate()).thenReturn(LocalDateTime.now().plusHours(24));
        when(sampleAuction.getSellerId()).thenReturn(999);
        return sampleAuction;
    }

    @Test
    @DisplayName("Should return empty message when no auctions found")
    void getAuctionContext_NoResults() {
        // Given
        when(cacheManager.getCache("auctionSearchCache")).thenReturn(cache);
        Page<AuctionDto> emptyPage = new PageImpl<>(new ArrayList<>());
        when(activeItemsService.searchAuctionsAdvanced(anyString(), isNull(), isNull(), isNull(), any(Pageable.class)))
                .thenReturn(emptyPage);

        // When
        String result = chatbotDataService.getAuctionContext("nonexistent", null, null, 123, false);

        // Then
        assertEquals("Không tìm thấy sản phẩm nào khớp với yêu cầu.", result);
    }

    @Test
    @DisplayName("Should return owner-specific message when no products for seller")
    void getAuctionContext_NoResultsForSeller() {
        // Given
        when(cacheManager.getCache("auctionSearchCache")).thenReturn(cache);
        Page<AuctionDto> emptyPage = new PageImpl<>(new ArrayList<>());
        when(activeItemsService.searchAuctionsAdvanced(anyString(), isNull(), isNull(), eq(123), any(Pageable.class)))
                .thenReturn(emptyPage);

        // When
        String result = chatbotDataService.getAuctionContext("", null, null, 123, true);

        // Then
        assertEquals("Bạn chưa đăng bán sản phẩm nào (hoặc sản phẩm chưa được duyệt).", result);
    }

    @Test
    @DisplayName("Should format auction context correctly")
    void getAuctionContext_WithResults() {
        // Given
        when(cacheManager.getCache("auctionSearchCache")).thenReturn(cache);
        AuctionDto sampleAuction = createSampleAuction();
        List<AuctionDto> auctions = List.of(sampleAuction);
        Page<AuctionDto> page = new PageImpl<>(auctions);
        when(activeItemsService.searchAuctionsAdvanced(anyString(), isNull(), isNull(), isNull(), any(Pageable.class)))
                .thenReturn(page);

        // When
        String result = chatbotDataService.getAuctionContext("laptop", null, null, 123, false);

        // Then
        assertNotNull(result);
        assertTrue(result.contains("Test Laptop"));
        assertTrue(result.contains("PHIÊN ĐẤU GIÁ #1"));
    }

    @Test
    @DisplayName("Should return false for email verification when userId is null")
    void isEmailVerified_NullUserId() {
        // When
        boolean result = chatbotDataService.isEmailVerified(null);

        // Then
        assertFalse(result);
        verify(userRepository, never()).findById(any());
    }

    @Test
    @DisplayName("Should return true for verified email")
    void isEmailVerified_VerifiedUser() {
        // Given
        User user = mock(User.class);
        when(user.isEmailVerified()).thenReturn(true);
        when(userRepository.findById(123)).thenReturn(Optional.of(user));

        // When
        boolean result = chatbotDataService.isEmailVerified(123);

        // Then
        assertTrue(result);
    }

    @Test
    @DisplayName("Should return false for unverified email")
    void isEmailVerified_UnverifiedUser() {
        // Given
        User user = mock(User.class);
        when(user.isEmailVerified()).thenReturn(false);
        when(userRepository.findById(123)).thenReturn(Optional.of(user));

        // When
        boolean result = chatbotDataService.isEmailVerified(123);

        // Then
        assertFalse(result);
    }

    @Test
    @DisplayName("Should return error when placing bid without login")
    void placeBidForUser_NotLoggedIn() {
        // When
        String result = chatbotDataService.placeBidForUser(null, 1, BigDecimal.valueOf(1000000));

        // Then
        assertTrue(result.startsWith("LỖI:"));
        assertTrue(result.contains("đăng nhập"));
    }

    @Test
    @DisplayName("Should return error when email not verified")
    void placeBidForUser_EmailNotVerified() {
        // Given
        User user = mock(User.class);
        when(user.isEmailVerified()).thenReturn(false);
        when(userRepository.findById(123)).thenReturn(Optional.of(user));

        // When
        String result = chatbotDataService.placeBidForUser(123, 1, BigDecimal.valueOf(1000000));

        // Then
        assertTrue(result.startsWith("LỖI_EMAIL:"));
        assertTrue(result.contains("xác thực email"));
    }

    @Test
    @DisplayName("Should place bid successfully")
    void placeBidForUser_Success() {
        // Given
        User user = mock(User.class);
        when(user.isEmailVerified()).thenReturn(true);
        when(userRepository.findById(123)).thenReturn(Optional.of(user));

        BidResult bidResult = mock(BidResult.class);
        when(bidResult.isSuccess()).thenReturn(true);
        when(bidService.placeBid(eq(1), eq(123), any(BigDecimal.class))).thenReturn(bidResult);

        // When
        String result = chatbotDataService.placeBidForUser(123, 1, BigDecimal.valueOf(1000000));

        // Then
        assertTrue(result.startsWith("THÀNH CÔNG:"));
    }

    @Test
    @DisplayName("Should translate wallet not found error")
    void translateError_WalletNotFound() {
        // Given
        User user = mock(User.class);
        when(user.isEmailVerified()).thenReturn(true);
        when(userRepository.findById(123)).thenReturn(Optional.of(user));

        BidResult bidResult = mock(BidResult.class);
        when(bidResult.isSuccess()).thenReturn(false);
        when(bidResult.getMessage()).thenReturn("Wallet not found");
        when(bidService.placeBid(eq(1), eq(123), any(BigDecimal.class))).thenReturn(bidResult);

        // When
        String result = chatbotDataService.placeBidForUser(123, 1, BigDecimal.valueOf(1000000));

        // Then
        assertTrue(result.contains("Bạn chưa có ví"));
    }

    @Test
    @DisplayName("Should translate insufficient funds error")
    void translateError_InsufficientFunds() {
        // Given
        User user = mock(User.class);
        when(user.isEmailVerified()).thenReturn(true);
        when(userRepository.findById(123)).thenReturn(Optional.of(user));

        BidResult bidResult = mock(BidResult.class);
        when(bidResult.isSuccess()).thenReturn(false);
        when(bidResult.getMessage()).thenReturn("Insufficient balance");
        when(bidService.placeBid(eq(1), eq(123), any(BigDecimal.class))).thenReturn(bidResult);

        // When
        String result = chatbotDataService.placeBidForUser(123, 1, BigDecimal.valueOf(1000000));

        // Then
        assertTrue(result.contains("Số dư ví không đủ"));
    }

    @Test
    @DisplayName("Should find auction by slug")
    void getAuctionBySlug_Found() {
        // Given
        Auction auction = mock(Auction.class);
        when(auctionRepository.findByItem_Slug("test-slug")).thenReturn(Optional.of(auction));

        // When
        Auction result = chatbotDataService.getAuctionBySlug("test-slug");

        // Then
        assertNotNull(result);
    }

    @Test
    @DisplayName("Should return null when auction not found by slug")
    void getAuctionBySlug_NotFound() {
        // Given
        when(auctionRepository.findByItem_Slug("nonexistent")).thenReturn(Optional.empty());

        // When
        Auction result = chatbotDataService.getAuctionBySlug("nonexistent");

        // Then
        assertNull(result);
    }

    @Test
    @DisplayName("Should return null for invalid auction index")
    void getAuctionByIndex_InvalidIndex() {
        // Given
        when(cacheManager.getCache("auctionSearchCache")).thenReturn(cache);
        when(cache.get("user_123")).thenReturn(null);

        // When
        AuctionDto result = chatbotDataService.getAuctionByIndex(123, 0);

        // Then
        assertNull(result);
    }

    @Test
    @DisplayName("Should return null for out of range index")
    void getAuctionByIndex_OutOfRange() {
        // Given
        when(cacheManager.getCache("auctionSearchCache")).thenReturn(cache);
        AuctionDto sampleAuction = createSampleAuction();
        List<AuctionDto> cachedList = List.of(sampleAuction);
        Cache.ValueWrapper wrapper = mock(Cache.ValueWrapper.class);
        when(wrapper.get()).thenReturn(cachedList);
        when(cache.get("user_123")).thenReturn(wrapper);

        // When
        AuctionDto result = chatbotDataService.getAuctionByIndex(123, 5);

        // Then
        assertNull(result);
    }

    @Test
    @DisplayName("Should return auction for valid index")
    void getAuctionByIndex_ValidIndex() {
        // Given
        when(cacheManager.getCache("auctionSearchCache")).thenReturn(cache);
        AuctionDto sampleAuction = createSampleAuction();
        List<AuctionDto> cachedList = List.of(sampleAuction);
        Cache.ValueWrapper wrapper = mock(Cache.ValueWrapper.class);
        when(wrapper.get()).thenReturn(cachedList);
        when(cache.get("user_123")).thenReturn(wrapper);

        // When
        AuctionDto result = chatbotDataService.getAuctionByIndex(123, 1);

        // Then
        assertNotNull(result);
        assertEquals(sampleAuction, result);
    }
}
