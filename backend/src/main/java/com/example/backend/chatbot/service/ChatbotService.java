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
    private ChatbotDataService chatbotDataService;

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

    // ==========================================
    // 👇 LOGIC CHÍNH ĐÃ ĐƯỢC NÂNG CẤP TẠI ĐÂY
    // ==========================================
    // Sửa tham số đầu vào từ String -> ChatRequest để lấy cả history
    public String processUserMessage(com.example.backend.chatbot.dto.ChatRequest request) {
        String userMessage = request.getMessage();
        List<com.example.backend.chatbot.dto.ChatRequest.HistoryItem> history = request.getHistory();
        Integer userId = request.getUserId();

        // 1. Tạo chuỗi lịch sử (Context)
        String historyContext = buildHistoryString(history);

        // 2. Phân tích Intent
        String analysisResult = analyzeIntent(userMessage);
        String[] parts = analysisResult.split("\\|");
        String intent = parts[0].trim();
        // Lấy keyword mặc định
        String rawKeyword = parts.length > 1 ? parts[1].trim() : "";
        String keyword = (rawKeyword.equalsIgnoreCase("null")) ? "" : rawKeyword;

        String systemInstruction = "Bạn là trợ lý ảo sàn đấu giá chuyên nghiệp. Quy tắc tư vấn:\n" +
                "1. LUÔN báo 'Giá hiện tại' và 'Giá cần đặt tiếp theo'. Nhắc khách không được đặt thấp hơn mức này.\n" +
                "2. Nếu thấy tag [GẤP - SẮP ĐÓNG], hãy dùng giọng điệu khẩn trương, thúc giục khách đặt ngay.\n" +
                "3. Nếu có 'Giá Mua Ngay', hãy gợi ý khách mua luôn để không phải chờ đợi.\n" +
                "4. Nếu sản phẩm là của chính khách hàng (có ghi chú), hãy báo cáo tình hình cho họ.\n" +
                "5. Không dùng markdown **. Trả lời ngắn gọn, đi thẳng vào vấn đề.";

        // 3. Xử lý từng trường hợp
        if ("SEARCH".equalsIgnoreCase(intent)) {
            // Parse giá tiền từ AI gửi về
            Double minPrice = null;
            Double maxPrice = null;
            boolean isMyItem = false;

            try {
                if (parts.length > 2 && !parts[2].equals("null")) minPrice = Double.parseDouble(parts[2]);
                if (parts.length > 3 && !parts[3].equals("null")) maxPrice = Double.parseDouble(parts[3]);
                if (parts.length > 4) isMyItem = Boolean.parseBoolean(parts[4].trim());
            } catch (NumberFormatException e) {
                // Ignore lỗi parse
            }

            String dbContext = chatbotDataService.getAuctionContext(keyword, minPrice, maxPrice, userId, isMyItem);

            // Kiểm tra nếu không tìm thấy nhưng có lịch sử chat
            if (dbContext.contains("Không tìm thấy") && !historyContext.isEmpty()) {
                // Fallback: Hỏi AI dựa trên context cũ
                String prompt = String.format(
                        "%s\n" +
                                "[LỊCH SỬ TRÒ CHUYỆN]:\n%s\n" +
                                "Khách hỏi tiếp: '%s'\n" +
                                "Hiện tại hệ thống tìm kiếm không thấy sản phẩm mới nào tên '%s'. Hãy khéo léo báo khách hoặc hỏi lại rõ hơn.",
                        systemInstruction, historyContext, userMessage, keyword
                );
                return callGeminiApi(prompt);
            }

            // Nếu có dữ liệu hoặc không có lịch sử
            String prompt = String.format(
                    "%s\n" +
                            "[LỊCH SỬ]:\n%s\n" +
                            "Khách tìm: '%s' (Giá: %s-%s)\n" +
                            "DỮ LIỆU THỰC TẾ (Đã tính toán luật đấu giá):\n%s\n\n" +
                            "Hãy tư vấn cho khách dựa trên các quy tắc trên.",
                    systemInstruction,
                    historyContext,
                    keyword,
                    (minPrice != null ? minPrice : "All"),
                    (maxPrice != null ? maxPrice : "All"),
                    dbContext
            );
            return callGeminiApi(prompt);

        } else {
            // Trường hợp CHAT hoặc SUPPORT
            String prompt = String.format(
                    "%s\n" +
                            "[LỊCH SỬ TRÒ CHUYỆN]:\n%s\n" +
                            "Khách nói tiếp: '%s'. Hãy trả lời tự nhiên, nối tiếp mạch câu chuyện.",
                    systemInstruction, historyContext, userMessage
            );
            return callGeminiApi(prompt);
        }
    }

    // 👇 Hàm mới: Biến đổi List thành String để AI đọc
    private String buildHistoryString(List<com.example.backend.chatbot.dto.ChatRequest.HistoryItem> history) {
        if (history == null || history.isEmpty()) return "";

        StringBuilder sb = new StringBuilder();
        // Chỉ lấy 5-6 câu gần nhất để tiết kiệm Token và không làm AI bị loạn
        int start = Math.max(0, history.size() - 6);

        for (int i = start; i < history.size(); i++) {
            var item = history.get(i);
            String role = "user".equals(item.getSender()) ? "Khách" : "Nhân viên";
            sb.append(role).append(": ").append(item.getText()).append("\n");
        }
        return sb.toString();
    }

    private String analyzeIntent(String userMessage) {
        String prompt = String.format(
                "Phân tích câu nói: \"%s\"\n" +
                        "Output format: INTENT|KEYWORD|MIN|MAX|IS_MINE\n" +
                        "Quy tắc QUAN TRỌNG về KEYWORD:\n" +
                        "1. Nếu tên sản phẩm là đồ điện tử/công nghệ, hãy ƯU TIÊN chuyển sang tên Tiếng Anh chuẩn (Ví dụ: 'máy tính' -> 'Laptop', 'tai nghe' -> 'Headphones', 'laptop gaming' -> 'Gaming Laptop').\n" +
                        "2. Đảo lại trật tự từ nếu cần thiết để khớp với tên sản phẩm quốc tế (Ví dụ: 'áo thun' -> 'T-Shirt').\n" +
                        "3. Loại bỏ các từ thừa như 'thông tin về', 'cho tôi xem', 'các loại'.\n" +
                        "4. IS_MINE: 'true' nếu khách hỏi 'của tôi', 'tôi bán'.\n" +
                        "Ví dụ:\n" +
                        "- 'cho xin in4 về laptop gaming' -> SEARCH|Gaming Laptop|null|null|false\n" + // 👈 AI sẽ tự sửa thành Gaming Laptop
                        "- 'tai nghe không dây' -> SEARCH|Wireless Headphones|null|null|false\n" +
                        "- 'Hàng tôi bán' -> SEARCH|null|null|null|true",
                userMessage
        );

        String result = callGeminiApi(prompt);
        if (result == null) return "CHAT|null|null|null|false";
        return result.trim();
    }

    // Hàm gọi API Gemini (Giữ nguyên như cũ)
    private String callGeminiApi(String prompt) {
        String url = String.format("%s/models/%s:generateContent?key=%s", baseUrl, chatModel, apiKey);

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
                    return ((String) partMap.get("text")).trim(); // Trim để xóa khoảng trắng thừa
                }
            }
            return "Xin lỗi, tôi không thể xử lý yêu cầu lúc này.";
        } catch (Exception e) {
            e.printStackTrace();
            return "Lỗi kết nối đến AI: " + e.getMessage();
        }
    }
}