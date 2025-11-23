package com.example.backend.user_profile;

import java.time.LocalDate;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.security.auth.User;
import com.example.backend.security.auth.UserRepository;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;

import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import jakarta.validation.constraints.PastOrPresent;
import jakarta.validation.constraints.Size;

@RestController
@RequestMapping("/api/profile")
@CrossOrigin // nếu FE khác origin
public class UserProfileController {

    private final UserProfileRepository profileRepo;
    private final UserRepository userRepo;

    public UserProfileController(UserProfileRepository profileRepo, UserRepository userRepo) {
        this.profileRepo = profileRepo;
        this.userRepo = userRepo;
    }

    // --- GET current user ID ---
    @GetMapping("/id")
    public ResponseEntity<?> getMyId(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).body(Map.of("success", false, "message", "Unauthorized"));
        }
        User user = userRepo.findByUsername(userDetails.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return ResponseEntity.ok(Map.of("success", true, "userId", user.getUserId()));
    }

    // --- GET profile theo userId ---
    @GetMapping("/{userId}")
    public ResponseEntity<?> getProfileByUserId(@PathVariable Integer userId) {
        return profileRepo.findByUser_UserId(userId)
                .map(this::okProfile)
                .orElseGet(() -> ResponseEntity.ok(Map.of(
                        "success", true,
                        "user_id", userId,
                        "profile", null)));
    }

    // --- GET profile theo username (tiện debug) ---
    @GetMapping("/by-username/{username}")
    public ResponseEntity<?> getProfileByUsername(@PathVariable String username) {
        return profileRepo.findByUser_Username(username)
                .map(this::okProfile)
                .orElse(ResponseEntity.status(404).body(Map.of(
                        "success", false,
                        "message", "Profile not found")));
    }

    // --- UPSERT (create or update) profile theo userId ---
    // Dùng PUT cho idempotent upsert
    @PutMapping("/{userId}")
    @Transactional
    public ResponseEntity<?> upsertProfile(@PathVariable Integer userId,
            @Valid @RequestBody UpsertProfileRequest req) {
        if (userId == null)
            return ResponseEntity.badRequest().body("User ID cannot be null");
        User user = userRepo.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        UserProfile p = profileRepo.findByUser_UserId(userId)
                .orElseGet(() -> {
                    UserProfile np = new UserProfile();
                    np.setUser(user);
                    return np;
                });

        p.setFullName(req.fullName());
        p.setPhone(req.phone());
        p.setAddress(req.address());
        p.setBio(req.bio());
        p.setAvatarUrl(req.avatarUrl());
        p.setDateOfBirth(req.dateOfBirth());

        UserProfile saved = profileRepo.save(p);

        return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Profile saved",
                "profileId", saved.getProfileId()));
    }

    // --- DTO (record) ---
    public record UpsertProfileRequest(
            @Size(max = 120, message = "fullName <= 120 ký tự") String fullName,

            @Size(max = 20, message = "phone <= 20 ký tự") String phone,

            @Size(max = 255, message = "address <= 255 ký tự") String address,

            @Size(max = 500, message = "bio <= 500 ký tự") String bio,

            @Size(max = 500, message = "avatarUrl <= 500 ký tự") String avatarUrl,

            @PastOrPresent(message = "dateOfBirth không được ở tương lai") LocalDate dateOfBirth) {
    }

    // --- Helper: build JSON trả về ---
    private ResponseEntity<Map<String, Object>> okProfile(UserProfile p) {
        return ResponseEntity.ok(Map.of(
                "success", true,
                "user_id", p.getUser().getUserId(),
                "username", p.getUser().getUsername(),
                "email", p.getUser().getEmail(),
                "profile", Map.of(
                        "fullName", p.getFullName(),
                        "avatarUrl", p.getAvatarUrl(),
                        "phone", p.getPhone(),
                        "address", p.getAddress(),
                        "bio", p.getBio(),
                        "dateOfBirth", p.getDateOfBirth())));
    }

    // --- Basic error mapping cho IllegalArgumentException ---
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> handleIllegalArg(IllegalArgumentException ex) {
        return ResponseEntity.status(404).body(Map.of(
                "success", false,
                "message", ex.getMessage()));
    }
}
