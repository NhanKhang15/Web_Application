package com.example.backend.security.login;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.security.auth.User;
import com.example.backend.security.google_facebook_auth.JwtService;
import com.example.backend.user_profile.IsProfileCompleted;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class LoginController {

  private final Login_Check_Password checker;      // service bạn sẵn có
  private final IsProfileCompleted profileChecker; // service ở Cách A
  private final JwtService jwt;

  @PostMapping("/login")
  public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest request) {
    Optional<User> ok = checker.verify(request.getUsername(), request.getPassword());

    Map<String, Object> response = new HashMap<>();
    if (ok.isEmpty()) {
      response.put("success", false);
      response.put("message", "Sai tài khoản hoặc mật khẩu!");
      return ResponseEntity.status(401).body(response);
    }

    User u = ok.get();
    boolean completed = profileChecker.isProfileCompleted(u.getUserId());

    // tạo JWT (role tuỳ bạn, tạm "USER")
    String token = jwt.generate(u.getUserId(), u.getUsername(), "USER");

    response.put("success", true);
    response.put("message", "Login thành công!!!!");
    response.put("token", token);
    response.put("user_id", u.getUserId());
    response.put("username", u.getUsername());
    response.put("email", u.getEmail());
    response.put("profileCompleted", completed);

    return ResponseEntity.ok(response);
  }
}