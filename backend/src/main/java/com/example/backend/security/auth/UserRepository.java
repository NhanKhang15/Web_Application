package com.example.backend.security.auth;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;;

public interface UserRepository extends JpaRepository<User, Integer> {
    Optional<User> findByUsername(String username);

    Optional<User> findByEmail(String email);

    Optional<User> findBySocialProviderAndSocialUID(User.SocialProvider sp, String uid);

    boolean existsByUsername(String username);

    boolean existsByEmail(String email);

    // xác định coi đả điền form chưa
    @Query("""
            SELECT CASE
                WHEN COUNT(p) > 0 THEN true ELSE false END
            FROM UserProfile p
            WHERE p.user.userId = :userId
                AND p.fullName IS NOT NULL AND TRIM(p.fullName) <> ''
                AND p.phone    IS NOT NULL AND TRIM(p.phone)    <> ''
                AND p.dateOfBirth IS NOT NULL
            """)
    Boolean isProfileCompleted(@Param("userId") Integer userId);

    // Search users by username (for chat)
    @Query("SELECT u FROM User u WHERE LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%')) AND u.userId <> :excludeUserId ORDER BY u.username ASC")
    java.util.List<User> searchByUsername(@Param("keyword") String keyword,
            @Param("excludeUserId") Integer excludeUserId);
}