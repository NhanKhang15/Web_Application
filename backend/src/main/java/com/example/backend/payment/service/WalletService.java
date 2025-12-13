package com.example.backend.payment.service;

import com.example.backend.payment.entity.Direction;
import com.example.backend.payment.entity.TopupOrder;
import com.example.backend.payment.entity.TransactionType;
import com.example.backend.payment.entity.Wallet;
import com.example.backend.payment.entity.WalletTransaction;
import com.example.backend.payment.repository.TopupOrderRepository;
import com.example.backend.payment.repository.WalletRepository;
import com.example.backend.payment.repository.WalletTransactionRepository;
import com.example.backend.security.auth.User;
import com.example.backend.security.auth.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class WalletService {

    private final WalletRepository walletRepo;
    private final WalletTransactionRepository wtRepo;
    private final TopupOrderRepository topupOrderRepo; // To fetch TopupOrder for relation
    private final UserRepository userRepo; // To fetch User if needed

    public WalletService(WalletRepository walletRepo,
            WalletTransactionRepository wtRepo,
            TopupOrderRepository topupOrderRepo,
            UserRepository userRepo) {
        this.walletRepo = walletRepo;
        this.wtRepo = wtRepo;
        this.topupOrderRepo = topupOrderRepo;
        this.userRepo = userRepo;
    }

    @Transactional
    public void addBalance(Integer userId,
            BigDecimal amount,
            Long topupId,
            String stripeSessionId,
            String paymentIntentId) {

        System.out.println("🔄 [WALLET] addBalance called - UserId: " + userId + ", Amount: " + amount);

        // 1. Find or create wallet
        Wallet wallet = walletRepo.findByUser_UserId(userId)
                .orElseGet(() -> {
                    System.out.println("📦 [WALLET] Creating new wallet for userId: " + userId);
                    User user = userRepo.findById(userId)
                            .orElseThrow(() -> new RuntimeException("User not found"));
                    Wallet w = new Wallet();
                    w.setUser(user);
                    w.setBalance(BigDecimal.ZERO);
                    return walletRepo.save(w);
                });

        BigDecimal oldBalance = wallet.getBalance();

        // 2. Add balance
        wallet.setBalance(wallet.getBalance().add(amount));
        walletRepo.save(wallet);
        System.out.println("💵 [WALLET] Balance updated: " + oldBalance + " -> " + wallet.getBalance());

        // 3. Log transaction
        WalletTransaction tx = new WalletTransaction();
        tx.setUser(wallet.getUser());
        tx.setType(TransactionType.TOPUP);
        tx.setDirection(Direction.IN);
        tx.setAmount(amount);

        if (topupId != null) {
            TopupOrder topup = topupOrderRepo.findById(topupId).orElse(null);
            tx.setTopupOrder(topup);
        }

        tx.setStripeSessionId(stripeSessionId);
        tx.setStripePaymentIntentId(paymentIntentId);
        tx.setNote("Topup via Stripe");
        wtRepo.save(tx);
        System.out.println("📝 [WALLET] Transaction logged successfully");
    }
}
