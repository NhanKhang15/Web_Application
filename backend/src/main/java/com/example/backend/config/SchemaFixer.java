package com.example.backend.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
public class SchemaFixer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    public SchemaFixer(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Override
    public void run(String... args) throws Exception {
        // Fix Auctions.Status ENUM
        fixAuctionsStatus();
        // Fix WalletTransactions.Type ENUM
        fixWalletTransactionType();
    }

    private void fixAuctionsStatus() {
        try {
            System.out.println("Attempting to fix Auctions.Status ENUM...");
            String sql = "ALTER TABLE Auctions MODIFY COLUMN Status ENUM('Draft', 'Scheduled', 'Open', 'Ended', 'Closed', 'Cancelled', 'Processing')";
            jdbcTemplate.execute(sql);
            System.out.println("Auctions.Status ENUM fixed successfully!");
        } catch (Exception e) {
            System.err.println("Failed to fix Auctions.Status: " + e.getMessage());
        }
    }

    private void fixWalletTransactionType() {
        try {
            System.out.println("Attempting to fix WalletTransactions.Type ENUM...");
            String sql = "ALTER TABLE WalletTransactions MODIFY COLUMN Type ENUM('TOPUP', 'BID_FREEZE', 'BID_RELEASE', 'PAYMENT', 'REFUND', 'SALE_INCOME')";
            jdbcTemplate.execute(sql);
            System.out.println("WalletTransactions.Type ENUM fixed successfully!");
        } catch (Exception e) {
            System.err.println("Failed to fix WalletTransactions.Type: " + e.getMessage());
        }
    }
}
