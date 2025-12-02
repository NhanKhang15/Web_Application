package com.example.backend.payment.dto;

import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
public class TopupRequest {
    private BigDecimal amount;
}
