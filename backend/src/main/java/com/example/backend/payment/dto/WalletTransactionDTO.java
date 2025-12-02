package com.example.backend.payment.dto;

import com.example.backend.payment.entity.Direction;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class WalletTransactionDTO {
    private LocalDateTime updatedAt;
    private BigDecimal amount;
    private Direction direction;
    private String stripePaymentIntentId;
    private String note;
}
