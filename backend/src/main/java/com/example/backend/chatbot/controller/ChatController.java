package com.example.backend.chatbot.controller;

import com.example.backend.chatbot.dto.ChatRequest;
import com.example.backend.chatbot.dto.ChatResponse;
import com.example.backend.chatbot.service.ChatbotService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/chatbot")
public class ChatController {

    @Autowired
    private ChatbotService chatbotService;

    @PostMapping("/message")
    public ResponseEntity<ChatResponse> chat(@RequestBody ChatRequest request) {
        String response = chatbotService.processUserMessage(request.getMessage());
        return ResponseEntity.ok(new ChatResponse(response));
    }
}
