package com.example.backend.user_profile;

import java.time.LocalDate;

import com.example.backend.security.auth.User;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
@Entity
@Table(name = "UserProfiles")
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ProfileID")
    private Integer profileId;

    @OneToOne(optional = false)
    @JoinColumn(name = "UserID", referencedColumnName = "UserID", unique = true, nullable = false)
    private User user;

    @Column(name = "FullName", length = 100)
    private String fullName;

    @Column(name = "Phone", length = 20)
    private String phone;

    @Column(name = "Address", length = 200)
    private String address;

    @Column(name = "Bio", length = 500)
    private String bio;

    @Column(name = "AvatarUrl", length = 300)
    private String avatarUrl;

    @Column(name = "DateOfBirth")
    private LocalDate dateOfBirth;

    // --- getters & setters ---
    public Integer getProfileId() { return profileId; }
    public void setProfileId(Integer profileId) { this.profileId = profileId; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public LocalDate getDateOfBirth() { return dateOfBirth; }
    public void setDateOfBirth(LocalDate dateOfBirth) { this.dateOfBirth = dateOfBirth; }
}
