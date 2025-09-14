package com.example.backend.security.signup;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class HashPassword {
    private final BCryptPasswordEncoder encoder;

    public HashPassword(BCryptPasswordEncoder encoder) {
        this.encoder = encoder;
    }

    /** Hash BCrypt cho mật khẩu raw */
    public String hash(String raw) {
        return encoder.encode(raw);
    }

    /** Option: verify (để test nếu cần) */
    public boolean matches(String raw, String hashed) {
        return encoder.matches(raw, hashed);
    }
}
