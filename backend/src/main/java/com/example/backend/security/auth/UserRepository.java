package com.example.backend.security.auth;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
;

public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    Optional<User> findBySocialProviderAndSocialUID(User.SocialProvider sp, String uid);
    boolean existsByUsername(String username);
}