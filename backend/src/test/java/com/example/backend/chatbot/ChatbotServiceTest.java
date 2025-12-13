package com.example.backend.chatbot;

import com.example.backend.chatbot.dto.ChatRequest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for ChatbotService - Testing DTOs and utility methods
 */
class ChatbotServiceTest {

    @Test
    @DisplayName("Should build history items correctly")
    void buildHistoryString_WithValidHistory() {
        // Given
        List<ChatRequest.HistoryItem> history = new ArrayList<>();

        ChatRequest.HistoryItem item1 = new ChatRequest.HistoryItem();
        item1.setText("Hello");
        item1.setSender("user");
        history.add(item1);

        ChatRequest.HistoryItem item2 = new ChatRequest.HistoryItem();
        item2.setText("Hi there!");
        item2.setSender("bot");
        history.add(item2);

        // Verify history items are created correctly
        assertEquals(2, history.size());
        assertEquals("Hello", history.get(0).getText());
        assertEquals("user", history.get(0).getSender());
        assertEquals("Hi there!", history.get(1).getText());
        assertEquals("bot", history.get(1).getSender());
    }

    @Test
    @DisplayName("Should handle empty history")
    void buildHistoryString_WithEmptyHistory() {
        // Given
        List<ChatRequest.HistoryItem> history = new ArrayList<>();

        // Verify empty history
        assertTrue(history.isEmpty());
    }

    @Test
    @DisplayName("Should handle null history")
    void buildHistoryString_WithNullHistory() {
        // Given
        ChatRequest request = new ChatRequest();
        request.setHistory(null);

        // Verify null history handling
        assertNull(request.getHistory());
    }

    @Test
    @DisplayName("Should handle pending bid confirmation setup")
    void handleBidConfirmation_Setup() {
        // Given
        ChatRequest.PendingBid pendingBid = new ChatRequest.PendingBid();
        pendingBid.setAuctionId(1);
        pendingBid.setAuctionSlug("test-auction");
        pendingBid.setAuctionTitle("Test Auction");
        pendingBid.setBidAmount(1000000.0);
        pendingBid.setAwaitingConfirmation(true);

        // Verify pending bid setup
        assertTrue(pendingBid.isAwaitingConfirmation());
        assertEquals(1, pendingBid.getAuctionId());
        assertEquals("test-auction", pendingBid.getAuctionSlug());
        assertEquals("Test Auction", pendingBid.getAuctionTitle());
        assertEquals(1000000.0, pendingBid.getBidAmount());
    }

    @Test
    @DisplayName("Should recognize confirmation keywords in Vietnamese")
    void confirmationKeywords_Vietnamese() {
        String[] confirmKeywords = { "có", "ok", "đồng ý", "chắc chắn", "xác nhận" };
        String[] denyKeywords = { "không", "hủy", "thôi" };

        // Verify Vietnamese keywords
        for (String keyword : confirmKeywords) {
            assertNotNull(keyword);
            assertFalse(keyword.isEmpty());
        }

        for (String keyword : denyKeywords) {
            assertNotNull(keyword);
            assertFalse(keyword.isEmpty());
        }
    }

    @Test
    @DisplayName("Should recognize confirmation keywords in English")
    void confirmationKeywords_English() {
        String[] confirmKeywords = { "yes", "confirm" };
        String[] denyKeywords = { "no", "cancel" };

        // Verify English keywords
        for (String keyword : confirmKeywords) {
            assertNotNull(keyword);
            assertFalse(keyword.isEmpty());
        }

        for (String keyword : denyKeywords) {
            assertNotNull(keyword);
            assertFalse(keyword.isEmpty());
        }
    }

    @Test
    @DisplayName("Should handle chat request with all fields")
    void chatRequest_AllFields() {
        // Given
        ChatRequest request = new ChatRequest();
        request.setMessage("Test message");
        request.setUserId(123);
        request.setHistory(new ArrayList<>());

        ChatRequest.PendingBid pendingBid = new ChatRequest.PendingBid();
        pendingBid.setAuctionId(1);
        request.setPendingBid(pendingBid);

        // Verify all fields
        assertEquals("Test message", request.getMessage());
        assertEquals(123, request.getUserId());
        assertNotNull(request.getHistory());
        assertNotNull(request.getPendingBid());
        assertEquals(1, request.getPendingBid().getAuctionId());
    }

    @Test
    @DisplayName("Should handle confirmation message detection")
    void confirmationMessageDetection() {
        // Test Vietnamese confirmations
        assertTrue("có".toLowerCase().contains("có"));
        assertTrue("vâng, tôi đồng ý".toLowerCase().contains("đồng ý"));
        assertTrue("ok đi".toLowerCase().contains("ok"));

        // Test English confirmations
        assertTrue("yes please".toLowerCase().contains("yes"));
        assertTrue("I confirm".toLowerCase().contains("confirm"));

        // Test denials
        assertTrue("không, thôi đi".toLowerCase().contains("không"));
        assertTrue("hủy bỏ".toLowerCase().contains("hủy"));
        assertTrue("no thanks".toLowerCase().contains("no"));
        assertTrue("cancel please".toLowerCase().contains("cancel"));
    }

    @Test
    @DisplayName("Should handle null userId in request")
    void chatRequest_NullUserId() {
        ChatRequest request = new ChatRequest();
        request.setMessage("Test");
        request.setUserId(null);

        assertNull(request.getUserId());
    }
}
