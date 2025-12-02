package com.example.backend.payment.controller;

import com.example.backend.payment.dto.TopupRequest;
import com.example.backend.payment.service.TopupService;
import com.example.backend.security.config.CustomUserDetails;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/topups")
public class TopupController {

    private final TopupService topupService;

    public TopupController(TopupService topupService) {
        this.topupService = topupService;
    }

    @PostMapping("/create-checkout-session")
    public ResponseEntity<?> createCheckoutSession(@RequestBody TopupRequest dto,
            @AuthenticationPrincipal CustomUserDetails user) {
        try {
            if (user == null) {
                return ResponseEntity.status(401).body("Unauthorized");
            }
            Integer userId = user.getUserId();
            BigDecimal amount = dto.getAmount();

            if (amount == null || amount.compareTo(new BigDecimal("10000")) < 0) {
                return ResponseEntity.badRequest().body("Số tiền nạp tối thiểu 10.000 VND");
            }

            String checkoutUrl = topupService.createCheckoutSession(userId, amount);
            return ResponseEntity.ok(Map.of("checkoutUrl", checkoutUrl));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("Error creating Stripe session: " + e.getMessage());
        }
    }

    @org.springframework.web.bind.annotation.GetMapping("/verify/{topupId}")
    public ResponseEntity<?> verifyTopup(@org.springframework.web.bind.annotation.PathVariable Long topupId) {
        boolean success = topupService.verifyTopupSession(topupId);
        if (success) {
            return ResponseEntity.ok("Verified");
        } else {
            return ResponseEntity.badRequest().body("Verification failed or pending");
        }
    }
}
