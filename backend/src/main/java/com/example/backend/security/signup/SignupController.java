package com.example.backend.security.signup;

import java.util.HashMap;
import java.util.Map;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.security.auth.User;
import com.example.backend.security.auth.UserRepository;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api")
public class SignupController {

    private final UserRepository userRepository;
    private final HashPassword hasher;

    public SignupController(UserRepository userRepository, HashPassword hasher) {
        this.userRepository = userRepository;
        this.hasher = hasher;
    }

    @PostMapping("/signup")
    public ResponseEntity<Map<String, Object>> signup(@Valid @RequestBody SignupRequest req) {
        Map<String, Object> res = new HashMap<>();

        // chuẩn hoá input nhẹ
        String username = req.getUsername().trim();
        String email = req.getEmail().trim().toLowerCase();
        String rawPwd = req.getPassword();

        // check tồn tại
        if (userRepository.findByUsername(username).isPresent()) {
            return build(false, "Username đã tồn tại!", 0, username, "null");
        }
        if (userRepository.findByEmail(email).isPresent()) {
            return build(false, "Email đã tồn tại!", 0, username, "null");
        }

        try {
            // create user
            User u = new User();
            u.setUsername(username);
            u.setEmail(email);
            u.setPasswordHashed(hasher.hash(rawPwd)); // lưu vào cột PasswordHashed

            User saved = userRepository.save(u);

            return build(true, "Tạo tài khoản thành công! Lưu ý, hãy xác thực tài khoản của bạn qua email.",
                    saved.getUserId(), saved.getUsername(), saved.getEmail());

        } catch (DataIntegrityViolationException dup) {
            // fallback nếu đua nhau gửi request
            String msg = "Username hoặc Email đã tồn tại!";
            return build(false, msg, 0, username, "null");
        } catch (Exception e) {
            return build(false, "Lỗi hệ thống khi tạo tài khoản!", 0, username, "null");
        }
    }

    @PostMapping("/change-email")
    public ResponseEntity<Map<String, Object>> changeEmail(@RequestBody ChangeEmailRequest req) {
        System.out.println("ChangeEmail called: current=" + req.currentEmail() + ", new=" + req.newEmail());
        String currentEmail = req.currentEmail();
        String newEmail = req.newEmail();

        if (currentEmail == null || newEmail == null || currentEmail.isBlank() || newEmail.isBlank()) {
            return build(false, "Vui lòng nhập đầy đủ thông tin!", 0, "null", "null");
        }

        currentEmail = currentEmail.trim().toLowerCase();
        newEmail = newEmail.trim().toLowerCase();

        // 1. Find user by currentEmail
        User user = userRepository.findByEmail(currentEmail).orElse(null);
        if (user == null) {
            return build(false, "Email hiện tại không tồn tại!", 0, "null", "null");
        }

        // 2. Check if newEmail is already taken
        if (userRepository.findByEmail(newEmail).isPresent()) {
            return build(false, "Email mới đã tồn tại!", 0, user.getUsername(), "null");
        }

        // 3. Update email
        user.setEmail(newEmail);
        userRepository.save(user);

        return build(true, "Cập nhật email thành công!", user.getUserId(), user.getUsername(), newEmail);
    }

    public record ChangeEmailRequest(String currentEmail, String newEmail) {
    }

    private ResponseEntity<Map<String, Object>> build(boolean success, String message, int userId, String username,
            String email) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", success);
        response.put("message", message);
        response.put("user_id", success ? userId : 0);
        response.put("username", success ? username : "null");
        response.put("email", success ? email : "null");
        return ResponseEntity.ok(response);
    }
}
