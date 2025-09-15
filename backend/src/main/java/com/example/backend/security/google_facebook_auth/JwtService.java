package com.example.backend.security.google_facebook_auth;


import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.time.Instant;
import java.util.Date;
import java.util.Map;

@Component
public class JwtService {
  private final Key key;

  public JwtService(@Value("${app.jwt.secret}") String secret) {
    this.key = Keys.hmacShaKeyFor(secret.getBytes());
  }

  public String generate(Integer userId, String username, String role) {
    Instant now = Instant.now();
    return Jwts.builder()
        .setSubject(String.valueOf(userId))
        .addClaims(Map.of("username", username, "role", role))
        .setIssuedAt(Date.from(now))
        .setExpiration(Date.from(now.plusSeconds(60L * 60L * 24L * 7L))) // 7 days
        .signWith(key)
        .compact();
  }
}