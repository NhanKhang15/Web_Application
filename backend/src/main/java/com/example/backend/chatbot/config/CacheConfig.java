package com.example.backend.chatbot.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

/**
 * Configuration for Caffeine cache with TTL.
 * Replaces in-memory ConcurrentHashMap with proper cache management.
 */
@Configuration
@EnableCaching
public class CacheConfig {

    @Value("${chatbot.cache.ttl-minutes:30}")
    private int cacheTtlMinutes;

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager cacheManager = new CaffeineCacheManager("auctionSearchCache");
        cacheManager.setCaffeine(Caffeine.newBuilder()
                .expireAfterWrite(cacheTtlMinutes, TimeUnit.MINUTES)
                .maximumSize(1000)
                .recordStats()); // Enable stats for monitoring
        return cacheManager;
    }
}
