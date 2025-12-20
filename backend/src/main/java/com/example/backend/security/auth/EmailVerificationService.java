package com.example.backend.security.auth;

import java.time.LocalDateTime;
import java.util.Random;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailVerificationService {

    @Autowired
    private EmailVerificationTokenRepository tokenRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JavaMailSender mailSender;

    public void createVerificationToken(User user, String token) {
        EmailVerificationToken myToken = new EmailVerificationToken(token, user);
        tokenRepository.save(myToken);
    }

    public String generateOTP() {
        Random random = new Random();
        int otp = 100000 + random.nextInt(900000);
        return String.valueOf(otp);
    }

    public void sendVerificationEmail(User user, String otp) {
        String subject = "Email Verification";
        String message = "Your verification code is: " + otp;

        SimpleMailMessage email = new SimpleMailMessage();
        email.setFrom("khangnhanopi@gmail.com"); // Hardcode theo yêu cầu để fix lỗi Brevo
        email.setTo(user.getEmail());
        email.setSubject(subject);
        email.setText(message);
        mailSender.send(email);
    }

    public VerificationResult verifyEmail(String email, String otp) {
        User user = userRepository.findByEmail(email)
                .orElse(null);

        if (user == null) {
            return VerificationResult.USER_NOT_FOUND;
        }

        if (user.isEmailVerified()) {
            return VerificationResult.ALREADY_VERIFIED;
        }

        EmailVerificationToken verificationToken = tokenRepository.findByUser(user);

        if (verificationToken == null) {
            return VerificationResult.INVALID_TOKEN;
        }

        if (!verificationToken.getToken().equals(otp)) {
            return VerificationResult.INVALID_TOKEN;
        }

        if (verificationToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            return VerificationResult.EXPIRED_TOKEN;
        }

        user.setEmailVerified(true);
        user.setEmailVerifiedAt(LocalDateTime.now());
        userRepository.save(user);
        tokenRepository.delete(verificationToken);

        return VerificationResult.SUCCESS;
    }

    public void resendVerificationCode(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        if (user.isEmailVerified()) {
            throw new RuntimeException("Email already verified");
        }

        // Delete existing token if any
        EmailVerificationToken existingToken = tokenRepository.findByUser(user);
        if (existingToken != null) {
            tokenRepository.delete(existingToken);
        }

        String otp = generateOTP();
        createVerificationToken(user, otp);
        sendVerificationEmail(user, otp);
    }

    public enum VerificationResult {
        SUCCESS,
        USER_NOT_FOUND,
        INVALID_TOKEN,
        EXPIRED_TOKEN,
        ALREADY_VERIFIED
    }
}
