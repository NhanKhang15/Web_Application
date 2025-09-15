package com.example.backend.security.google_facebook_auth;


import com.example.backend.security.auth.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.text.Normalizer;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SocialAuthService {
  private final UserRepository users;

  public User upsertFromGoogleAttributes(Map<String, Object> attrs) {
    // Google claims: sub, email, email_verified, name, given_name, picture...
    String sub = (String) attrs.get("sub");
    String email = (String) attrs.get("email");
    String name  = (String) attrs.getOrDefault("name", "Google User");

    // 1) tìm theo social uid
    Optional<User> bySocial = users.findBySocialProviderAndSocialUID(User.SocialProvider.google, sub);
    if (bySocial.isPresent()) {
      User u = bySocial.get();
      return users.save(u);
    }

    // 2) chưa có → thử map theo email (nếu có)
    User u = null;
    if (email != null && !email.isBlank()) {
      u = users.findByEmail(email).orElse(null);
    }

    if (u == null) {
      // 3) tạo user mới
      u = new User();
      u.setUsername(generateUsername(name));
      u.setEmail(email);
      u.setAuthPrimary(User.AuthPrimary.google);
      u.setSocialProvider(User.SocialProvider.google);
      u.setSocialUID(sub);
      u.setStatus(User.Status.active);
      u.setCreatedAt(LocalDateTime.now());
    } else {
      // 3b) link Google vào user có sẵn (đăng ký local trước đó)
      u.setAuthPrimary(User.AuthPrimary.google); // hoặc giữ nguyên, tùy policy
      u.setSocialProvider(User.SocialProvider.google);
      u.setSocialUID(sub);
    }

    return users.save(u);
  }

  private String generateUsername(String name) {
    // slug + số chống trùng
    String base = Normalizer.normalize(name, Normalizer.Form.NFD)
        .replaceAll("\\p{InCombiningDiacriticalMarks}+", "")
        .replaceAll("[^a-zA-Z0-9]+", "")
        .toLowerCase(Locale.ROOT);
    if (base.isBlank()) base = "user";
    String candidate = base;
    int i = 1;
    while (users.existsByUsername(candidate)) {
      candidate = base + i++;
    }
    return candidate;
  }
}