package com.example.backend.currency;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST Controller for currency exchange rates.
 * Provides endpoints to get rates and convert amounts.
 */
@RestController
@RequestMapping("/api/currency")
public class CurrencyController {

    private final CurrencyService currencyService;

    public CurrencyController(CurrencyService currencyService) {
        this.currencyService = currencyService;
    }

    /**
     * Get all exchange rates (VND to other currencies)
     */
    @GetMapping("/rates")
    public ResponseEntity<RatesResponse> getRates() {
        return ResponseEntity.ok(new RatesResponse(
                currencyService.getAllRates(),
                currencyService.getSupportedCurrencies(),
                currencyService.getLastUpdated()));
    }

    /**
     * Convert amount from VND to target currency
     */
    @GetMapping("/convert")
    public ResponseEntity<ConvertResponse> convert(
            @RequestParam BigDecimal amount,
            @RequestParam String to) {
        BigDecimal converted = currencyService.convert(amount, to);
        String symbol = currencyService.getSymbol(to);

        return ResponseEntity.ok(new ConvertResponse(
                amount,
                "VND",
                converted,
                to.toUpperCase(),
                symbol));
    }

    // Response DTOs
    record RatesResponse(
            Map<String, Double> rates,
            Map<String, String> symbols,
            LocalDateTime lastUpdated) {
    }

    record ConvertResponse(
            BigDecimal originalAmount,
            String fromCurrency,
            BigDecimal convertedAmount,
            String toCurrency,
            String symbol) {
    }
}
