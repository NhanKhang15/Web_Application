package com.example.backend.currency;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.annotation.PostConstruct;

/**
 * Service to fetch and cache currency exchange rates.
 * Uses ExchangeRate-API.com free tier (1500 requests/month).
 * VND is the base currency - all rates are relative to VND.
 */
@Service
public class CurrencyService {

    @Value("${currency.api.key:}")
    private String apiKey;

    private static final String API_URL = "https://v6.exchangerate-api.com/v6/%s/latest/VND";
    private static final String FALLBACK_API_URL = "https://open.er-api.com/v6/latest/VND";

    private Map<String, Double> rates = new HashMap<>();
    private LocalDateTime lastUpdated;
    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    // Supported currencies with symbols
    public static final Map<String, String> CURRENCY_SYMBOLS = Map.of(
            "VND", "₫",
            "USD", "$",
            "EUR", "€",
            "GBP", "£",
            "JPY", "¥",
            "KRW", "₩",
            "CNY", "¥",
            "THB", "฿");

    @PostConstruct
    public void init() {
        refreshRates();
    }

    /**
     * Refresh exchange rates every 6 hours
     */
    @Scheduled(fixedRate = 6 * 60 * 60 * 1000) // 6 hours
    public void refreshRates() {
        try {
            String url;
            if (apiKey != null && !apiKey.isBlank()) {
                url = String.format(API_URL, apiKey);
            } else {
                // Use fallback free API (no key required)
                url = FALLBACK_API_URL;
            }

            String response = restTemplate.getForObject(url, String.class);
            JsonNode root = objectMapper.readTree(response);

            if ("success".equals(root.path("result").asText())) {
                JsonNode ratesNode = root.path("rates");
                Map<String, Double> newRates = new HashMap<>();

                for (String currency : CURRENCY_SYMBOLS.keySet()) {
                    if (ratesNode.has(currency)) {
                        newRates.put(currency, ratesNode.get(currency).asDouble());
                    }
                }

                if (!newRates.isEmpty()) {
                    this.rates = newRates;
                    this.lastUpdated = LocalDateTime.now();
                    System.out.println("✅ Currency rates updated: " + newRates.size() + " currencies");
                }
            }
        } catch (Exception e) {
            System.err.println("⚠️ Failed to fetch exchange rates: " + e.getMessage());
            // Keep using existing rates if refresh fails
            if (rates.isEmpty()) {
                // Initialize with fallback rates if no rates exist
                initFallbackRates();
            }
        }
    }

    /**
     * Fallback rates in case API is unavailable
     */
    private void initFallbackRates() {
        rates.put("VND", 1.0);
        rates.put("USD", 0.00004); // ~25,000 VND = 1 USD
        rates.put("EUR", 0.000037);
        rates.put("GBP", 0.000032);
        rates.put("JPY", 0.006);
        rates.put("KRW", 0.055);
        rates.put("CNY", 0.00029);
        rates.put("THB", 0.0014);
        lastUpdated = LocalDateTime.now();
    }

    /**
     * Convert amount from VND to target currency
     */
    public BigDecimal convert(BigDecimal amountVND, String toCurrency) {
        if (amountVND == null || toCurrency == null) {
            return BigDecimal.ZERO;
        }

        if ("VND".equalsIgnoreCase(toCurrency)) {
            return amountVND;
        }

        Double rate = rates.get(toCurrency.toUpperCase());
        if (rate == null) {
            return amountVND; // Unknown currency, return original
        }

        return amountVND.multiply(BigDecimal.valueOf(rate))
                .setScale(2, RoundingMode.HALF_UP);
    }

    /**
     * Get all exchange rates
     */
    public Map<String, Double> getAllRates() {
        return new HashMap<>(rates);
    }

    /**
     * Get last update time
     */
    public LocalDateTime getLastUpdated() {
        return lastUpdated;
    }

    /**
     * Get currency symbol
     */
    public String getSymbol(String currencyCode) {
        return CURRENCY_SYMBOLS.getOrDefault(currencyCode.toUpperCase(), currencyCode);
    }

    /**
     * Get all supported currencies
     */
    public Map<String, String> getSupportedCurrencies() {
        return CURRENCY_SYMBOLS;
    }
}
