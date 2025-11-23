package com.example.backend.security.google_facebook_auth;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;
import java.util.Map;

@Component
public class JwtService {

  private final SecretKey key;
  private final long ttlSeconds; // thời hạn token (s)

  public JwtService(
      @Value("${app.jwt.secret}") String secret,
      @Value("${app.jwt.ttl-seconds:604800}") long ttlSeconds // default 7 ngày
  ) {
    byte[] keyBytes;

    // Cho phép truyền secret dạng "base64:<chuỗi-base64>"
    if (secret != null && secret.startsWith("base64:")) {
      String b64 = secret.substring("base64:".length());
      keyBytes = Decoders.BASE64.decode(b64);
    } else {
      // Fallback: dùng UTF-8 bytes từ chuỗi plaintext
      keyBytes = secret.getBytes(StandardCharsets.UTF_8);
    }

    if (keyBytes.length < 32) { // 32 bytes = 256-bit
      throw new IllegalArgumentException(
          "app.jwt.secret is too short. It must be >= 256 bits (32 bytes). " +
              "Use a base64 32-byte key, e.g. APP_JWT_SECRET=base64:<your-44-char-base64>");
    }

    this.key = Keys.hmacShaKeyFor(keyBytes);
    this.ttlSeconds = ttlSeconds;
  }

  public String generate(Integer userId, String username, String role) {
    Instant now = Instant.now();
    return Jwts.builder()
        .setSubject(String.valueOf(userId))
        .addClaims(Map.of("username", username, "role", role))
        .setIssuedAt(Date.from(now))
        .setExpiration(Date.from(now.plusSeconds(ttlSeconds)))
        .signWith(key) // HS256 sẽ được suy ra từ loại key HMAC
        .compact();
  }

  // --- Validate & Extract ---
  public io.jsonwebtoken.Claims parse(String token) {
    return Jwts.parserBuilder()
        .setSigningKey(key)
        .build()
        .parseClaimsJws(token)
        .getBody();
  }

  public Integer extractUserId(String token) {
    String subject = parse(token).getSubject();
    return Integer.parseInt(subject);
  }

  public String extractUsername(String token) {
    return parse(token).get("username", String.class);
  }

  public boolean validate(String token) {
    try {
      parse(token);
      return true;
    } catch (Exception e) {
      return false;
    }
  }
}
