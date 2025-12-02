package com.example.backend.security.auth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/auth")
public class VerificationController {

    @Autowired
    private EmailVerificationService emailVerificationService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/verify-email")
    public ResponseEntity<?> verifyEmail(@RequestParam String email, @RequestParam String code) {
        EmailVerificationService.VerificationResult result = emailVerificationService.verifyEmail(email, code);

        switch (result) {
            case SUCCESS:
                return ResponseEntity.ok("Email verified successfully");
            case USER_NOT_FOUND:
                return ResponseEntity.badRequest().body("User not found");
            case INVALID_TOKEN:
                return ResponseEntity.badRequest().body("Invalid verification code");
            case EXPIRED_TOKEN:
                return ResponseEntity.badRequest().body("Verification code expired");
            case ALREADY_VERIFIED:
                return ResponseEntity.badRequest().body("Email already verified");
            default:
                return ResponseEntity.internalServerError().body("An error occurred");
        }
    }

    @PostMapping("/resend-verification-email")
    public ResponseEntity<?> resendVerificationEmail(@RequestBody Map<String, String> request) {
        String newEmail = request.get("email");

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return ResponseEntity.status(401).body("Unauthorized");
        }

        String currentUsername = auth.getName();

        // SỬA: Dùng userRepository (biến) thay vì UserRepository (class)
        User user = userRepository.findByUsername(currentUsername)
                .orElse(userRepository.findByEmail(currentUsername).orElse(null));

        if (user == null) {
            return ResponseEntity.badRequest().body("User not found in session");
        }

        if (newEmail != null && !newEmail.trim().isEmpty() && !newEmail.equals(user.getEmail())) {

            // SỬA: Dùng userRepository
            if (userRepository.existsByEmail(newEmail)) {
                return ResponseEntity.badRequest().body("Email này đã được sử dụng bởi tài khoản khác.");
            }

            user.setEmail(newEmail);
            user.setEmailVerified(false);

            // SỬA: Dùng userRepository
            userRepository.save(user);
        }

        try {
            emailVerificationService.resendVerificationCode(user.getEmail());
            return ResponseEntity.ok("Mã xác thực đã được gửi tới " + user.getEmail());
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
