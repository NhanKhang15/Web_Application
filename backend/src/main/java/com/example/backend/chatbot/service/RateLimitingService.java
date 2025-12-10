package com.example.backend.chatbot.service;

import io.github.bucket4j.Bandwidth;
import io.github.bucket4j.Bucket;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Rate limiting service using Bucket4j.
 * Provides per-user rate limiting to prevent API abuse.
 */
@Slf4j
@Service
public class RateLimitingService {

    private final Map<String, Bucket> buckets = new ConcurrentHashMap<>();

    @Value("${chatbot.rate-limit.requests-per-minute:30}")
    private int requestsPerMinute;

    @Value("${chatbot.rate-limit.enabled:true}")
    private boolean enabled;

    /**
     * Try to consume one token from the user's bucket.
     * 
     * @param userId User identifier (can be null for anonymous users)
     * @return true if request is allowed, false if rate limited
     */
    public boolean tryConsume(String userId) {
        if (!enabled) {
            return true;
        }

        String key = userId != null ? userId : "anonymous";
        Bucket bucket = buckets.computeIfAbsent(key, this::createBucket);

        boolean consumed = bucket.tryConsume(1);

        if (!consumed) {
            log.warn("Rate limit exceeded for user: {}", key);
        }

        return consumed;
    }

    /**
     * Get remaining tokens for a user.
     */
    public long getRemainingTokens(String userId) {
        String key = userId != null ? userId : "anonymous";
        Bucket bucket = buckets.get(key);
        return bucket != null ? bucket.getAvailableTokens() : requestsPerMinute;
    }

    private Bucket createBucket(String key) {
        log.debug("Creating rate limit bucket for user: {} with {} requests/minute", key, requestsPerMinute);

        Bandwidth limit = Bandwidth.builder()
                .capacity(requestsPerMinute)
                .refillGreedy(requestsPerMinute, Duration.ofMinutes(1))
                .build();

        return Bucket.builder()
                .addLimit(limit)
                .build();
    }

    /**
     * Clear expired buckets (can be called periodically for cleanup)
     */
    public void clearBuckets() {
        int size = buckets.size();
        buckets.clear();
        log.info("Cleared {} rate limit buckets", size);
    }
}
