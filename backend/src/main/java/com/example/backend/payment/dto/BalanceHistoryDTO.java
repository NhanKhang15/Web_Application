package com.example.backend.payment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BalanceHistoryDTO {
    private LocalDateTime time; // Thời điểm giao dịch
    private BigDecimal balance; // Số dư tại thời điểm đó
    private BigDecimal change; // Số tiền thay đổi (+/-)
    private String description; // Mô tả (e.g., "Bid on Auction #123")
    private String direction; // "IN" hoặc "OUT"
}
