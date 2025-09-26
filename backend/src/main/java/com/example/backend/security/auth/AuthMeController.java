package com.example.backend.security.auth;

import java.util.Map;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import com.example.backend.user_profile.IsProfileCompleted;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin // nếu FE khác origin
public class AuthMeController {

  private final UserRepository userRepo;
  private final IsProfileCompleted profileChecker;

  public AuthMeController(UserRepository userRepo, IsProfileCompleted profileChecker) {
    this.userRepo = userRepo;
    this.profileChecker = profileChecker;
  }

  @GetMapping("/me")
  public ResponseEntity<?> me(Authentication authentication,
                              @AuthenticationPrincipal Object principal) {
    if (authentication == null || !authentication.isAuthenticated()) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
          .body(Map.of("success", false, "message", "Unauthorized"));
    }

    String username = null;
    String email = null;

    // 1) Local login
    if (principal instanceof UserDetails ud) {
      username = ud.getUsername();
    }

    // 2) OAuth2 (Google/Facebook)
    if (principal instanceof OAuth2User ou) {
      var attr = ou.getAttributes();
      email = (String) attr.getOrDefault("email", null);
      if (username == null) username = (String) attr.getOrDefault("name", null);
      if (username == null && email != null) username = email;
    }
    if (authentication instanceof OAuth2AuthenticationToken oat && email == null) {
      var attr = oat.getPrincipal().getAttributes();
      email = (String) attr.getOrDefault("email", null);
    }

    // Tìm user trong DB
    Optional<User> uOpt = Optional.empty();
    if (username != null && userRepo.existsByUsername(username)) {
      uOpt = userRepo.findByUsername(username);
    }
    if (uOpt.isEmpty() && email != null && userRepo.existsByEmail(email)) {
      uOpt = userRepo.findByEmail(email);
    }
    if (uOpt.isEmpty()) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(Map.of("success", false, "message", "User not found in DB"));
    }

    User u = uOpt.get();
    boolean completed = profileChecker.isProfileCompleted(u.getUserId());

    return ResponseEntity.ok(Map.of(
        "success", true,
        "userId", u.getUserId(),
        "username", u.getUsername(),
        "email", u.getEmail(),
        "profileCompleted", completed
    ));
  }
}
