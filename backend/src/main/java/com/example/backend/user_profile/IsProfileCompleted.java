package com.example.backend.user_profile;

import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.security.auth.UserRepository;

@Service
public class IsProfileCompleted {

  private final UserRepository userRepo;

  public IsProfileCompleted(UserRepository userRepo) {
    this.userRepo = userRepo;
  }

  @Transactional(readOnly = true)
  public boolean isProfileCompleted(Integer userId) {
    // Gọi query ở UserRepository → có thể trả null nếu không có profile
    Boolean ok = userRepo.isProfileCompleted(userId);
    return Optional.ofNullable(ok).orElse(false);
  }
}
