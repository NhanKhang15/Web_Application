package com.example.backend.payment.service;

import com.example.backend.payment.config.StripeProperties;
import com.example.backend.payment.entity.TopupOrder;
import com.example.backend.payment.entity.TopupStatus;
import com.example.backend.payment.repository.TopupOrderRepository;
import com.example.backend.security.auth.User;
import com.example.backend.security.auth.UserRepository;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Service
public class TopupService {

        private final TopupOrderRepository topupRepo;
        private final StripeProperties stripeProps;
        private final UserRepository userRepo;
        private final WalletService walletService;

        public TopupService(TopupOrderRepository topupRepo,
                        StripeProperties stripeProps,
                        UserRepository userRepo,
                        WalletService walletService) {
                this.topupRepo = topupRepo;
                this.stripeProps = stripeProps;
                this.userRepo = userRepo;
                this.walletService = walletService;
        }

        public String createCheckoutSession(Integer userId, BigDecimal amount) throws Exception {
                User user = userRepo.findById(userId)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                // 1. Create TopupOrder in DB (PENDING)
                TopupOrder topup = new TopupOrder();
                topup.setUser(user);
                topup.setAmount(amount);
                topup.setCurrency(stripeProps.getCurrency().toUpperCase());
                topup.setStatus(TopupStatus.PENDING);
                topup = topupRepo.save(topup);

                // 2. Convert amount to smallest unit
                // VND: 100,000 VND -> 100000
                // USD: 10.50 USD -> 1050
                long amountInMinorUnit;
                if ("vnd".equalsIgnoreCase(stripeProps.getCurrency())) {
                        amountInMinorUnit = amount.longValue();
                } else {
                        amountInMinorUnit = amount.multiply(BigDecimal.valueOf(100)).longValue();
                }

                SessionCreateParams params = SessionCreateParams.builder()
                                .setMode(SessionCreateParams.Mode.PAYMENT)
                                .setSuccessUrl(stripeProps.getSuccessUrl() + "?topupId=" + topup.getTopupId())
                                .setCancelUrl(stripeProps.getCancelUrl() + "?topupId=" + topup.getTopupId())
                                .addLineItem(
                                                SessionCreateParams.LineItem.builder()
                                                                .setQuantity(1L)
                                                                .setPriceData(
                                                                                SessionCreateParams.LineItem.PriceData
                                                                                                .builder()
                                                                                                .setCurrency(stripeProps
                                                                                                                .getCurrency())
                                                                                                .setUnitAmount(amountInMinorUnit)
                                                                                                .setProductData(
                                                                                                                SessionCreateParams.LineItem.PriceData.ProductData
                                                                                                                                .builder()
                                                                                                                                .setName("Topup for user "
                                                                                                                                                + user.getUsername())
                                                                                                                                .build())
                                                                                                .build())
                                                                .build())
                                .putMetadata("topupId", String.valueOf(topup.getTopupId()))
                                .putMetadata("userId", String.valueOf(userId))
                                .build();

                Session session = Session.create(params);

                // 3. Save StripeSessionId
                topup.setStripeSessionId(session.getId());
                topupRepo.save(topup);

                return session.getUrl();
        }

        @Transactional
        public void handleSuccessfulTopup(Long topupId, String paymentIntentId) {
                System.out.println("💰 [TOPUP] handleSuccessfulTopup called - topupId: " + topupId
                                + ", paymentIntentId: " + paymentIntentId);

                TopupOrder topup = topupRepo.findById(topupId).orElse(null);
                if (topup == null) {
                        System.out.println("❌ [TOPUP] Topup not found for id: " + topupId);
                        return;
                }

                // Prevent double processing
                if (!topup.getStatus().equals(TopupStatus.PENDING)) {
                        System.out.println("⚠️ [TOPUP] Topup already processed. Current status: " + topup.getStatus());
                        return;
                }

                topup.setStatus(TopupStatus.PAID);
                topup.setStripePaymentIntentId(paymentIntentId);
                topupRepo.save(topup);
                System.out.println("✅ [TOPUP] Topup status updated to PAID");

                // Add balance to wallet
                System.out.println("💳 [TOPUP] Adding balance to wallet - UserId: " + topup.getUser().getUserId()
                                + ", Amount: " + topup.getAmount());
                walletService.addBalance(topup.getUser().getUserId(), topup.getAmount(),
                                topup.getTopupId(), topup.getStripeSessionId(), paymentIntentId);
                System.out.println("✅ [TOPUP] Balance added successfully!");
        }

        @Transactional
        public boolean verifyTopupSession(Long topupId) {
                System.out.println("🔍 [VERIFY] Starting verification for topupId: " + topupId);
                try {
                        TopupOrder topup = topupRepo.findById(topupId).orElse(null);
                        if (topup == null) {
                                System.out.println("❌ [VERIFY] Topup not found for id: " + topupId);
                                return false;
                        }
                        System.out.println("📋 [VERIFY] Topup found - Status: " + topup.getStatus() + ", Amount: "
                                        + topup.getAmount());

                        if (topup.getStatus() == TopupStatus.PAID) {
                                System.out.println("✅ [VERIFY] Topup already PAID, returning true");
                                return true;
                        }

                        String sessionId = topup.getStripeSessionId();
                        if (sessionId == null) {
                                System.out.println("❌ [VERIFY] Stripe session ID is null");
                                return false;
                        }
                        System.out.println("🔗 [VERIFY] Stripe Session ID: " + sessionId);

                        Session session = Session.retrieve(sessionId);
                        System.out.println("💳 [VERIFY] Stripe payment status: " + session.getPaymentStatus());

                        if ("paid".equals(session.getPaymentStatus())) {
                                System.out.println("✅ [VERIFY] Payment confirmed! Processing topup...");
                                handleSuccessfulTopup(topupId, session.getPaymentIntent());
                                System.out.println("✅ [VERIFY] Topup processed successfully!");
                                return true;
                        } else {
                                System.out.println("⏳ [VERIFY] Payment not yet paid. Status: "
                                                + session.getPaymentStatus());
                        }
                } catch (Exception e) {
                        System.out.println("❌ [VERIFY] Exception occurred: " + e.getMessage());
                        e.printStackTrace();
                }
                return false;
        }
}
