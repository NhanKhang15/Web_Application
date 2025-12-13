package com.example.backend.chatbot;

import com.example.backend.chatbot.service.RateLimitingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for RateLimitingService
 */
class RateLimitingServiceTest {

    private RateLimitingService rateLimitingService;

    @BeforeEach
    void setUp() {
        rateLimitingService = new RateLimitingService();
        ReflectionTestUtils.setField(rateLimitingService, "requestsPerMinute", 5);
        ReflectionTestUtils.setField(rateLimitingService, "enabled", true);
    }

    @Test
    @DisplayName("Should allow requests within rate limit")
    void tryConsume_WithinLimit() {
        // Given
        String userId = "user123";

        // When & Then
        for (int i = 0; i < 5; i++) {
            assertTrue(rateLimitingService.tryConsume(userId),
                    "Request " + (i + 1) + " should be allowed");
        }
    }

    @Test
    @DisplayName("Should block requests exceeding rate limit")
    void tryConsume_ExceedsLimit() {
        // Given
        String userId = "user456";

        // Consume all tokens
        for (int i = 0; i < 5; i++) {
            rateLimitingService.tryConsume(userId);
        }

        // When
        boolean result = rateLimitingService.tryConsume(userId);

        // Then
        assertFalse(result, "Request exceeding limit should be blocked");
    }

    @Test
    @DisplayName("Should handle null userId as anonymous")
    void tryConsume_NullUserId() {
        // When
        boolean result = rateLimitingService.tryConsume(null);

        // Then
        assertTrue(result);
    }

    @Test
    @DisplayName("Should allow all requests when disabled")
    void tryConsume_Disabled() {
        // Given
        ReflectionTestUtils.setField(rateLimitingService, "enabled", false);
        String userId = "user789";

        // When - try to exceed the limit
        for (int i = 0; i < 100; i++) {
            boolean result = rateLimitingService.tryConsume(userId);
            assertTrue(result, "All requests should be allowed when disabled");
        }
    }

    @Test
    @DisplayName("Should return correct remaining tokens")
    void getRemainingTokens_AfterConsumption() {
        // Given
        String userId = "userTokens";

        // When
        long initialTokens = rateLimitingService.getRemainingTokens(userId);
        rateLimitingService.tryConsume(userId);
        rateLimitingService.tryConsume(userId);
        long remainingTokens = rateLimitingService.getRemainingTokens(userId);

        // Then
        assertEquals(5, initialTokens);
        assertEquals(3, remainingTokens);
    }

    @Test
    @DisplayName("Should isolate rate limits per user")
    void tryConsume_UserIsolation() {
        // Given
        String user1 = "user1";
        String user2 = "user2";

        // Consume all tokens for user1
        for (int i = 0; i < 5; i++) {
            rateLimitingService.tryConsume(user1);
        }

        // When - user2 should still have tokens
        boolean user1Result = rateLimitingService.tryConsume(user1);
        boolean user2Result = rateLimitingService.tryConsume(user2);

        // Then
        assertFalse(user1Result, "User1 should be rate limited");
        assertTrue(user2Result, "User2 should not be affected by User1's limit");
    }

    @Test
    @DisplayName("Should clear all buckets")
    void clearBuckets() {
        // Given
        rateLimitingService.tryConsume("user1");
        rateLimitingService.tryConsume("user2");

        // When
        rateLimitingService.clearBuckets();

        // Then - new requests should get fresh buckets
        long tokens = rateLimitingService.getRemainingTokens("user1");
        assertEquals(5, tokens);
    }
}
