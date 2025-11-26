package com.example.backend.security.auth;

import org.springframework.data.jpa.repository.JpaRepository;

public interface EmailVerificationTokenRepository extends JpaRepository<EmailVerificationToken, Long> {
    EmailVerificationToken findByToken(String token);

    EmailVerificationToken findByUser(User user);
}
