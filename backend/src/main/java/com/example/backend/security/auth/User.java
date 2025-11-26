package com.example.backend.security.auth;

import java.time.LocalDateTime;

import com.example.backend.user_profile.UserProfile;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Lob;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

@Entity
@Table(name = "Users", uniqueConstraints = {
        @UniqueConstraint(name = "uq_email", columnNames = { "Email" }),
        @UniqueConstraint(name = "uq_social", columnNames = { "SocialProvider", "SocialUID" })
})
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "UserID")
    private Integer userId;

    @Column(name = "Username", nullable = false, length = 50)
    private String username;

    @Column(name = "Email", length = 100)
    private String email;

    @Lob
    @Column(name = "PasswordHashed")
    private String passwordHashed;

    @Enumerated(EnumType.STRING)
    @Column(name = "SocialProvider", length = 20)
    private SocialProvider socialProvider;

    @Column(name = "SocialUID", length = 255)
    private String socialUID;

    @Enumerated(EnumType.STRING)
    @Column(name = "AuthPrimary", nullable = false, length = 20)
    private AuthPrimary authPrimary = AuthPrimary.local;

    @Enumerated(EnumType.STRING)
    @Column(name = "Status", nullable = false, length = 20)
    private Status status = Status.active;

    @Column(name = "CreatedAt", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToOne(mappedBy = "user")
    private UserProfile profile;

    @Column(name = "EmailVerified")
    private boolean emailVerified = false;

    @Column(name = "EmailVerifiedAt")
    private LocalDateTime emailVerifiedAt;

    // Getters and Setters
    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPasswordHashed() {
        return passwordHashed;
    }

    public void setPasswordHashed(String passwordHashed) {
        this.passwordHashed = passwordHashed;
    }

    public SocialProvider getSocialProvider() {
        return socialProvider;
    }

    public void setSocialProvider(SocialProvider socialProvider) {
        this.socialProvider = socialProvider;
    }

    public String getSocialUID() {
        return socialUID;
    }

    public void setSocialUID(String socialUID) {
        this.socialUID = socialUID;
    }

    public AuthPrimary getAuthPrimary() {
        return authPrimary;
    }

    public void setAuthPrimary(AuthPrimary authPrimary) {
        this.authPrimary = authPrimary;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public UserProfile getProfile() {
        return profile;
    }

    public void setProfile(UserProfile profile) {
        this.profile = profile;
    }

    public boolean isEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(boolean emailVerified) {
        this.emailVerified = emailVerified;
    }

    public LocalDateTime getEmailVerifiedAt() {
        return emailVerifiedAt;
    }

    public void setEmailVerifiedAt(LocalDateTime emailVerifiedAt) {
        this.emailVerifiedAt = emailVerifiedAt;
    }

    public enum SocialProvider {
        google, facebook
    }

    public enum AuthPrimary {
        local, google, facebook
    }

    public enum Status {
        active, disabled, banned
    }
}