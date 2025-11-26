package com.example.backend.security.auth;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
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
        String email = request.get("email");
        try {
            emailVerificationService.resendVerificationCode(email);
            return ResponseEntity.ok("Verification code sent");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
