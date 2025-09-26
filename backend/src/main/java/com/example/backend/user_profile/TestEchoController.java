package com.example.backend.user_profile;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test")
public class TestEchoController {

    @GetMapping("/ok")
    public ResponseEntity<TestMsg> ok() {
        return ResponseEntity.ok(new TestMsg(true, "test endpoint is alive"));
    }

    @GetMapping("/echo/{userId}")
    public ResponseEntity<TestEcho> echo(@PathVariable("userId") Integer userId) {
        return ResponseEntity.ok(new TestEcho(true, userId));
    }

    // DTOs tối giản, tránh Map.of (để khỏi dính version JDK/Jackson)
    public static class TestMsg {
        public boolean ok;
        public String msg;
        public TestMsg(boolean ok, String msg) { this.ok = ok; this.msg = msg; }
    }
    public static class TestEcho {
        public boolean ok;
        public Integer userId;
        public TestEcho(boolean ok, Integer userId) { this.ok = ok; this.userId = userId; }
    }
}
