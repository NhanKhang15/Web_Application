package com.example.backend.payment.config;

import com.stripe.Stripe;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

@Component
public class StripeConfig {

    private final StripeProperties stripeProperties;

    public StripeConfig(StripeProperties stripeProperties) {
        this.stripeProperties = stripeProperties;
    }

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeProperties.getSecretKey();
        System.out.println("✅ Stripe initialized");
    }
}
