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
        try {
            System.out.println("Attempting to fix database schema for AuctionStatus...");
            // Update the ENUM definition to include 'Processing'
            String sql = "ALTER TABLE Auctions MODIFY COLUMN Status ENUM('Draft', 'Scheduled', 'Open', 'Ended', 'Closed', 'Cancelled', 'Processing')";
            jdbcTemplate.execute(sql);
            System.out.println("Database schema fixed successfully!");
        } catch (Exception e) {
            System.err.println("Failed to fix database schema: " + e.getMessage());
            // Don't throw exception to avoid stopping the app if it's already fixed or
            // another issue
        }
    }
}
