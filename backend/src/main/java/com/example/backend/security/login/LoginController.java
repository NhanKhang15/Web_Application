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

@RestController
@RequestMapping("/api")
public class LoginController {

    private final Login_Check_Password checker;

    public LoginController(Login_Check_Password checker) {
        this.checker = checker;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody LoginRequest request) {
        Optional<User> ok = checker.verify(request.getUsername(), request.getPassword());

        boolean success = ok.isPresent();
        User info = ok.orElse(null);

        Map<String, Object> response = new HashMap<>();
        response.put("success", success);
        response.put("message", success ? "Login thành công!!!!" : "Sai tài khoản hoặc mật khẩu!");
        response.put("user_id", success ? info.getUserId() : 0);
        response.put("username", success ? request.getUsername() : "null");
        response.put("email", success ? info.getEmail() : "null");

        return ResponseEntity.ok(response);
    }
}
