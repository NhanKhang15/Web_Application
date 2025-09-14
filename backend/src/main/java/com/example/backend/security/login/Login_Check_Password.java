package com.example.backend.security.login;

import java.util.Optional;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.backend.security.auth.User;
import com.example.backend.security.auth.UserRepository;

@Service
public class Login_Check_Password {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    public Login_Check_Password(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Tìm user theo username hoặc email, rồi check BCrypt.
     */
    public Optional<User> verify(String usernameOrEmail, String rawPassword) {
        Optional<User> byUsername = userRepository.findByUsername(usernameOrEmail);
        Optional<User> userOpt = byUsername.isPresent() ? byUsername : userRepository.findByEmail(usernameOrEmail);

        if (userOpt.isPresent()) {
            User u = userOpt.get();
            if (passwordEncoder.matches(rawPassword, u.getPasswordHashed())) {
                return Optional.of(u);
            }
        }
        return Optional.empty();
    }
}
