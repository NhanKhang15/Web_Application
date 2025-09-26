package com.example.backend.user_profile;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserProfileRepository extends JpaRepository<UserProfile, Integer> {
    Optional<UserProfile> findByUser_UserId(Integer userId);
    Optional<UserProfile> findByUser_Username(String username);
    boolean existsByUser_UserId(Integer userId);
}
