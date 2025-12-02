package com.example.backend.payment.controller;

import com.example.backend.payment.config.StripeProperties;
import com.example.backend.payment.service.TopupService;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.model.EventDataObjectDeserializer;
import com.stripe.model.checkout.Session;
import com.stripe.net.Webhook;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/webhook/stripe")
public class StripeWebhookController {

    private final StripeProperties stripeProps;
    private final TopupService topupService;
    private final SimpMessagingTemplate messagingTemplate;

    public StripeWebhookController(StripeProperties stripeProps,
            TopupService topupService,
            SimpMessagingTemplate messagingTemplate) {
        this.stripeProps = stripeProps;
        this.topupService = topupService;
        this.messagingTemplate = messagingTemplate;
    }

    @PostMapping
    public ResponseEntity<String> handleStripeWebhook(
            @RequestHeader("Stripe-Signature") String signature,
            @RequestBody String payload) {

        Event event;
        try {
            event = Webhook.constructEvent(
                    payload,
                    signature,
                    stripeProps.getWebhookSecret());
        } catch (SignatureVerificationException e) {
            System.out.println("❌ Invalid Stripe signature");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Invalid signature");
        } catch (Exception e) {
            System.out.println("❌ Webhook error: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Webhook error");
        }

        // Handle events
        if ("checkout.session.completed".equals(event.getType())) {
            handleCheckoutCompleted(event);
        }

        return ResponseEntity.ok("ok");
    }

    private void handleCheckoutCompleted(Event event) {
        EventDataObjectDeserializer dataObjectDeserializer = event.getDataObjectDeserializer();
        Object stripeObject = dataObjectDeserializer.getObject().orElse(null);

        if (stripeObject instanceof Session session) {
            String topupIdStr = session.getMetadata().get("topupId");
            String userIdStr = session.getMetadata().get("userId");
            if (topupIdStr == null)
                return;

            Long topupId = Long.valueOf(topupIdStr);

            // Delegate to service for transactional processing
            topupService.handleSuccessfulTopup(topupId, session.getPaymentIntent());

            // Send WebSocket notification
            if (userIdStr != null) {
                messagingTemplate.convertAndSend("/topic/wallet/" + userIdStr, "PAYMENT_SUCCESS");
            }
        }
    }
}
