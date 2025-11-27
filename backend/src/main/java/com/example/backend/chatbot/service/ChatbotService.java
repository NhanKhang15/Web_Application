package com.example.backend.chatbot.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ChatbotService {

    private final String baseUrl;
    private final String apiKey;
    private final String chatModel;
    private final double temperature;
    private final double topP;
    private final int topK;
    private final int maxOutputTokens;

    @Autowired
    private ProductService productService;

    private final RestTemplate restTemplate = new RestTemplate();

    public ChatbotService(
            @Value("${gemini.api.base-url}") String baseUrl,
            @Value("${gemini.api.key}") String apiKey,
            @Value("${gemini.model.chat}") String chatModel,
            @Value("${gemini.generation.temperature}") double temperature,
            @Value("${gemini.generation.top-p}") double topP,
            @Value("${gemini.generation.top-k}") int topK,
            @Value("${gemini.generation.max-output-tokens}") int maxOutputTokens) {
        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
        this.chatModel = chatModel;
        this.temperature = temperature;
        this.topP = topP;
        this.topK = topK;
        this.maxOutputTokens = maxOutputTokens;
    }

    public String processUserMessage(String userMessage) {
        // 1. GET DATA FROM DATABASE
        String dbInfo = productService.getProductStatus(userMessage);

        // 2. CREATE PROMPT
        String finalPrompt = String.format(
                "Bạn là một nhân viên hỗ trợ bán hàng thông minh. " +
                        "Dựa vào thông tin database sau đây: [%s]. " +
                        "Hãy trả lời câu hỏi của khách hàng: '%s'. " +
                        "Nếu hàng còn, hãy mời khách mua. Nếu hết, hãy xin lỗi khéo léo.",
                dbInfo, userMessage);

        // 3. CALL GEMINI API
        return callGeminiApi(finalPrompt);
    }

    private String callGeminiApi(String prompt) {
        // Construct URL: baseUrl + /models/ + chatModel + :generateContent +
        // ?key=apiKey
        String url = String.format("%s/models/%s:generateContent?key=%s", baseUrl, chatModel, apiKey);

        // Body structure
        Map<String, Object> part = new HashMap<>();
        part.put("text", prompt);

        Map<String, Object> content = new HashMap<>();
        content.put("parts", Collections.singletonList(part));

        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("temperature", temperature);
        generationConfig.put("topP", topP);
        generationConfig.put("topK", topK);
        generationConfig.put("maxOutputTokens", maxOutputTokens);

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("contents", Collections.singletonList(content));
        requestBody.put("generationConfig", generationConfig);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

            Map body = response.getBody();
            if (body != null && body.containsKey("candidates")) {
                List candidates = (List) body.get("candidates");
                if (!candidates.isEmpty()) {
                    Map candidate = (Map) candidates.get(0);
                    Map contentMap = (Map) candidate.get("content");
                    List parts = (List) contentMap.get("parts");
                    Map partMap = (Map) parts.get(0);
                    return (String) partMap.get("text");
                }
            }
            return "Xin lỗi, tôi không thể xử lý yêu cầu lúc này.";
        } catch (Exception e) {
            e.printStackTrace();
            return "Lỗi kết nối đến AI: " + e.getMessage();
        }
    }
}
