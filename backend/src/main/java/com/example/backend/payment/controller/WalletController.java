package com.example.backend.payment.controller;

import com.example.backend.payment.entity.Wallet;
import com.example.backend.payment.repository.WalletRepository;
import com.example.backend.security.config.CustomUserDetails;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/wallet")
public class WalletController {

    private final WalletRepository walletRepo;
    private final com.example.backend.payment.repository.WalletTransactionRepository wtRepo;

    public WalletController(WalletRepository walletRepo,
            com.example.backend.payment.repository.WalletTransactionRepository wtRepo) {
        this.walletRepo = walletRepo;
        this.wtRepo = wtRepo;
    }

    @GetMapping("/balance")
    public ResponseEntity<?> getBalance(@AuthenticationPrincipal CustomUserDetails user) {
        if (user == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        Wallet wallet = walletRepo.findByUser_UserId(user.getUserId()).orElse(null);
        BigDecimal balance = (wallet != null) ? wallet.getBalance() : BigDecimal.ZERO;

        return ResponseEntity.ok(Map.of("balance", balance));
    }

    @GetMapping("/transactions")
    public ResponseEntity<?> getTransactions(@AuthenticationPrincipal CustomUserDetails user) {
        if (user == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }
        var transactions = wtRepo.findByUser_UserIdOrderByCreatedAtDesc(user.getUserId())
                .stream()
                .map(t -> new com.example.backend.payment.dto.WalletTransactionDTO(
                        t.getCreatedAt(),
                        t.getAmount(),
                        t.getDirection(),
                        t.getStripePaymentIntentId(),
                        t.getNote()))
                .toList();
        return ResponseEntity.ok(transactions);
    }

    @GetMapping("/balance-history")
    public ResponseEntity<?> getBalanceHistory(@AuthenticationPrincipal CustomUserDetails user) {
        if (user == null) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        // Get all transactions ordered by time ASC to compute cumulative balance
        var transactions = wtRepo.findByUser_UserIdOrderByCreatedAtAsc(user.getUserId());

        java.util.List<com.example.backend.payment.dto.BalanceHistoryDTO> history = new java.util.ArrayList<>();
        BigDecimal cumulativeBalance = BigDecimal.ZERO;

        for (var tx : transactions) {
            BigDecimal change;
            if (tx.getDirection() == com.example.backend.payment.entity.Direction.IN) {
                change = tx.getAmount();
                cumulativeBalance = cumulativeBalance.add(tx.getAmount());
            } else {
                change = tx.getAmount().negate();
                cumulativeBalance = cumulativeBalance.subtract(tx.getAmount());
            }

            history.add(new com.example.backend.payment.dto.BalanceHistoryDTO(
                    tx.getCreatedAt(),
                    cumulativeBalance,
                    change,
                    tx.getNote(),
                    tx.getDirection().name()));
        }

        return ResponseEntity.ok(history);
    }
}
