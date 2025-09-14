package com.example.backend.security.BCrypt;

    
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class HashOnce {
    public static void main(String[] args) {
        String raw = "1234567";
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String hash = encoder.encode(raw);
        System.out.println("\n=== GEN BCRYPT ===");
        System.out.println("Raw     : " + raw);
        System.out.println("Hashed  : " + hash);
        System.out.println("Matches?: " + encoder.matches(raw, hash));
        System.out.println("==================\n");
    }
}
