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
    // @CrossOrigin(origins = "http://localhost:5173") // bật nếu bị CORS
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

            return build(true, "Tạo tài khoản thành công!!!!",
                    saved.getUserId(), saved.getUsername(), saved.getEmail());

        } catch (DataIntegrityViolationException dup) {
            // fallback nếu đua nhau gửi request
            String msg = "Username hoặc Email đã tồn tại!";
            return build(false, msg, 0, username, "null");
        } catch (Exception e) {
            return build(false, "Lỗi hệ thống khi tạo tài khoản!", 0, username, "null");
        }
    }

    private ResponseEntity<Map<String, Object>> build(boolean success, String message, int userId, String username, String email) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", success);
        response.put("message", message);
        response.put("user_id", success ? userId : 0);
        response.put("username", success ? username : "null");
        response.put("email", success ? email : "null");
        return ResponseEntity.ok(response);
    }
}
