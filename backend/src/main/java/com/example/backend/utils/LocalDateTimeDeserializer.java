package com.example.backend.utils;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;

/**
 * Custom deserializer for LocalDateTime that treats naive datetime strings (from datetime-local input)
 * as Vietnam time (+07:00), converting them to LocalDateTime in server timezone.
 * 
 * Example:
 *   Input:  "2025-11-21T17:14:00"  (from datetime-local, no timezone)
 *   → Treat as: "2025-11-21T17:14:00+07:00"  (Vietnam)
 *   → Convert to server LocalDateTime (if server is UTC, becomes 2025-11-21T10:14:00)
 */
public class LocalDateTimeDeserializer extends JsonDeserializer<LocalDateTime> {

    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ISO_LOCAL_DATE_TIME;
    private static final ZoneOffset VIETNAM_OFFSET = ZoneOffset.of("+07:00");

    @Override
    public LocalDateTime deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        String value = p.getText();
        if (value == null || value.isEmpty()) {
            return null;
        }

        try {
            // Parse as LocalDateTime (naive)
            LocalDateTime naive = LocalDateTime.parse(value, FORMATTER);
            
            // Treat as Vietnam time (+07:00)
            OffsetDateTime vietnamTime = naive.atOffset(VIETNAM_OFFSET);
            
            // Convert to server LocalDateTime (automatically handles server timezone conversion)
            // If server is UTC, this converts to UTC; if server is any other timezone, it converts accordingly
            return vietnamTime.toInstant().atZone(java.time.ZoneId.systemDefault()).toLocalDateTime();
        } catch (Exception e) {
            throw new IOException("Failed to deserialize LocalDateTime: " + value, e);
        }
    }
}
