package com.example.backend.chatbot.service;

import com.example.backend.auction.domain.auction.dto.AuctionDto;
import com.example.backend.chatbot.dto.ChatRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
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
    // MAIN LOGIC - UPGRADED WITH PLACE_BID
    // ==========================================
    public String processUserMessage(ChatRequest request) {
        String userMessage = request.getMessage();
        List<ChatRequest.HistoryItem> history = request.getHistory();
        Integer userId = request.getUserId();
        ChatRequest.PendingBid pendingBid = request.getPendingBid();

        // 1. Build history context
        String historyContext = buildHistoryString(history);

        // =====================================================
        // HANDLE BID CONFIRMATION (if awaiting confirmation)
        // =====================================================
        if (pendingBid != null && pendingBid.isAwaitingConfirmation()) {
            return handleBidConfirmation(userMessage, pendingBid, userId);
        }

        // 2. Analyze Intent
        String analysisResult = analyzeIntent(userMessage);
        String[] parts = analysisResult.split("\\|");
        String intent = parts[0].trim();
        String rawKeyword = parts.length > 1 ? parts[1].trim() : "";
        String keyword = (rawKeyword.equalsIgnoreCase("null")) ? "" : rawKeyword;

        // System instruction in English - AI will respond in user's language
        String systemInstruction = """
                You are a professional auction platform AI assistant. Follow these rules:
                1. ALWAYS mention 'Current Price' and 'Next Minimum Bid'. Remind users not to bid lower than this.
                2. If you see [URGENT - CLOSING SOON] tag, use urgent tone to encourage immediate bidding.
                3. If 'Buy Now Price' is available, suggest the user can buy immediately without waiting.
                4. If the product belongs to the customer (noted in data), report the status to them.
                5. Do NOT use markdown formatting like **bold**. Keep responses concise and direct.
                6. If user wants to place a bid, guide them to say: 'Bid [amount] for product #[number]'.
                7. IMPORTANT: Always respond in the SAME LANGUAGE as the user's message.
                """;

        // =====================================================
        // HANDLE OFF_TOPIC INTENT - Politely reject unrelated questions
        // =====================================================
        if ("OFF_TOPIC".equalsIgnoreCase(intent)) {
            return handleOffTopicMessage(userMessage);
        }

        // =====================================================
        // HANDLE PLACE_BID INTENT
        // =====================================================
        if ("PLACE_BID".equalsIgnoreCase(intent)) {
            return handlePlaceBidIntent(parts, userId, historyContext, systemInstruction);
        }

        // 3. Handle SEARCH
        if ("SEARCH".equalsIgnoreCase(intent)) {
            Double minPrice = null;
            Double maxPrice = null;
            boolean isMyItem = false;

            try {
                if (parts.length > 2 && !parts[2].equals("null"))
                    minPrice = Double.parseDouble(parts[2]);
                if (parts.length > 3 && !parts[3].equals("null"))
                    maxPrice = Double.parseDouble(parts[3]);
                if (parts.length > 4)
                    isMyItem = Boolean.parseBoolean(parts[4].trim());
            } catch (NumberFormatException e) {
                // Ignore
            }

            String dbContext = chatbotDataService.getAuctionContext(keyword, minPrice, maxPrice, userId, isMyItem);

            if (dbContext.contains("Không tìm thấy") && !historyContext.isEmpty()) {
                String prompt = String.format(
                        """
                                %s
                                [CHAT HISTORY]:
                                %s
                                User asks: '%s'
                                The system search found no products matching '%s'. Politely inform the user or ask for clarification.
                                Remember: Respond in the user's language.
                                """,
                        systemInstruction, historyContext, userMessage, keyword);
                return callGeminiApi(prompt);
            }

            String prompt = String.format(
                    """
                            %s
                            [CHAT HISTORY]:
                            %s
                            User searches: '%s' (Price range: %s - %s)
                            REAL DATABASE DATA (with auction rules calculated):
                            %s

                            Provide advice based on the rules above. If user wants to bid, remind them: 'Bid [amount] for product #[number]'.
                            Remember: Respond in the user's language.
                            """,
                    systemInstruction,
                    historyContext,
                    keyword,
                    (minPrice != null ? minPrice : "Any"),
                    (maxPrice != null ? maxPrice : "Any"),
                    dbContext);
            return callGeminiApi(prompt);

        } else {
            // CHAT or SUPPORT
            String prompt = String.format("""
                    %s
                    [CHAT HISTORY]:
                    %s
                    User says: '%s'. Respond naturally and continue the conversation.
                    Remember: Respond in the user's language.
                    """, systemInstruction, historyContext, userMessage);
            return callGeminiApi(prompt);
        }
    }

    // =====================================================
    // HANDLE PLACE_BID INTENT
    // =====================================================
    private String handlePlaceBidIntent(String[] parts, Integer userId, String historyContext,
            String systemInstruction) {
        // Format: PLACE_BID|AUCTION_INDEX|BID_AMOUNT
        int auctionIndex = -1;
        Double bidAmount = null;

        try {
            if (parts.length > 1 && !parts[1].equals("null")) {
                auctionIndex = Integer.parseInt(parts[1].trim());
            }
            if (parts.length > 2 && !parts[2].equals("null")) {
                bidAmount = Double.parseDouble(parts[2].trim());
            }
        } catch (NumberFormatException e) {
            // Ignore
        }

        // Check login
        if (userId == null) {
            return "⚠️ You need to log in to place a bid. Please log in and try again.";
        }

        // Check email verified
        if (!chatbotDataService.isEmailVerified(userId)) {
            return "⚠️ You need to verify your email before placing a bid.\n" +
                    "👉 Go to Profile > Verify Email to complete verification.";
        }

        // Check product selection
        if (auctionIndex <= 0) {
            return "❓ Which product do you want to bid on?\n" +
                    "💡 Please specify: 'Bid [amount] for product #[number]'\n" +
                    "Example: 'Bid 1 million for product #2'";
        }

        // Get auction from cache
        AuctionDto auction = chatbotDataService.getAuctionByIndex(userId, auctionIndex);
        if (auction == null) {
            return String.format("❌ Product #%d not found. Please search again before bidding.", auctionIndex);
        }

        // Check amount
        if (bidAmount == null || bidAmount <= 0) {
            return String.format("❓ How much do you want to bid for '%s'?\n" +
                    "💰 Current price: %,.0f VND\n" +
                    "💡 Say: 'Bid [amount] for product #%d'",
                    auction.getTitle(), auction.getCurrentPrice(), auctionIndex);
        }

        // Calculate minimum next bid
        BigDecimal currentPrice = auction.getCurrentPrice();
        BigDecimal minStep = auction.getMinStep() != null ? auction.getMinStep() : BigDecimal.ZERO;
        BigDecimal minNextBid = currentPrice.add(minStep);

        if (BigDecimal.valueOf(bidAmount).compareTo(minNextBid) < 0) {
            return String.format("❌ Bid must be at least %,.0f VND.\n" +
                    "📊 Current price: %,.0f VND\n" +
                    "📈 Bid step: %,.0f VND",
                    minNextBid, currentPrice, minStep);
        }

        // =====================================================
        // RETURN CONFIRMATION REQUEST (Frontend will save pendingBid)
        // =====================================================
        return String.format("CONFIRM_BID|%d|%s|%s|%.0f\n\n" +
                "🔔 CONFIRM BID:\n" +
                "📦 Product: %s\n" +
                "💰 Amount: %,.0f VND\n\n" +
                "Are you sure you want to place this bid? (Reply 'Yes' or 'No')",
                auction.getAuctionId(),
                auction.getSlug(),
                auction.getTitle(),
                bidAmount,
                auction.getTitle(),
                bidAmount);
    }

    // =====================================================
    // HANDLE BID CONFIRMATION
    // =====================================================
    private String handleBidConfirmation(String userMessage, ChatRequest.PendingBid pendingBid, Integer userId) {
        String normalizedMessage = userMessage.toLowerCase().trim();

        // Check confirmation - support both English and Vietnamese
        boolean isConfirmed = normalizedMessage.contains("có") ||
                normalizedMessage.contains("ok") ||
                normalizedMessage.contains("đồng ý") ||
                normalizedMessage.contains("yes") ||
                normalizedMessage.contains("chắc chắn") ||
                normalizedMessage.contains("xác nhận") ||
                normalizedMessage.contains("confirm");

        boolean isDenied = normalizedMessage.contains("không") ||
                normalizedMessage.contains("hủy") ||
                normalizedMessage.contains("thôi") ||
                normalizedMessage.contains("no") ||
                normalizedMessage.contains("cancel");

        if (isConfirmed) {
            // Execute bid
            String result = chatbotDataService.placeBidForUser(
                    userId,
                    pendingBid.getAuctionId(),
                    BigDecimal.valueOf(pendingBid.getBidAmount()));

            if (result.startsWith("THÀNH CÔNG")) {
                return "✅ " + result + "\n\n🎉 Good luck with your auction!";
            } else if (result.startsWith("LỖI_EMAIL")) {
                return "⚠️ " + result.replace("LỖI_EMAIL: ", "");
            } else {
                return "❌ " + result.replace("LỖI: ", "");
            }
        } else if (isDenied) {
            return "🔙 Cancelled. You can continue searching or bid on another product.";
        } else {
            return String.format("❓ Please confirm:\n" +
                    "📦 Product: %s\n" +
                    "💰 Amount: %,.0f VND\n\n" +
                    "Reply 'Yes' to place bid or 'No' to cancel.",
                    pendingBid.getAuctionTitle(),
                    pendingBid.getBidAmount());
        }
    }

    // Build history string for AI context
    private String buildHistoryString(List<ChatRequest.HistoryItem> history) {
        if (history == null || history.isEmpty())
            return "";

        StringBuilder sb = new StringBuilder();
        int start = Math.max(0, history.size() - 6);

        for (int i = start; i < history.size(); i++) {
            var item = history.get(i);
            String role = "user".equals(item.getSender()) ? "Customer" : "Assistant";
            sb.append(role).append(": ").append(item.getText()).append("\n");
        }
        return sb.toString();
    }

    private String analyzeIntent(String userMessage) {
        String prompt = String.format(
                """
                        Analyze this message: "%s"
                        Output format: INTENT|PARAM1|PARAM2|...

                        INTENT types:
                        1. SEARCH|KEYWORD|MIN_PRICE|MAX_PRICE|IS_MINE - Product search on auction platform
                        2. PLACE_BID|AUCTION_INDEX|BID_AMOUNT - Place bid (e.g., 'bid 500k for product #2' -> PLACE_BID|2|500000)
                        3. CHAT|null|null|null|false - General chat RELATED to auction/shopping (greetings, thanks, auction help)
                        4. OFF_TOPIC|null|null|null|false - Questions NOT related to auction platform

                        OFF_TOPIC examples (return OFF_TOPIC for these):
                        - Politics, news, current events
                        - Coding, programming, technical questions
                        - Math homework, academic questions
                        - Personal advice (relationships, health, career)
                        - Weather, sports scores
                        - Jokes, games, entertainment unrelated to auctions
                        - Requests to write essays, poems, stories
                        - Questions about AI itself, how chatbot works

                        Rules:
                        - If user says 'bid', 'đặt giá', 'place bid' + amount + product number -> PLACE_BID
                        - Convert '500k' to 500000, '1 million'/'1 triệu'/'1tr' to 1000000
                        - For SEARCH, prefer English keywords (e.g., 'máy tính' -> 'Laptop', 'tai nghe' -> 'Headphones')
                        - IS_MINE = true if user asks about 'my items', 'của tôi', 'my products'
                        - If question is clearly unrelated to auction/shopping -> OFF_TOPIC

                        Examples:
                        - 'đặt 500k cho sp #2' -> PLACE_BID|2|500000
                        - 'find laptop' -> SEARCH|Laptop|null|null|false
                        - 'hello' -> CHAT|null|null|null|false
                        - 'thanks for help' -> CHAT|null|null|null|false
                        - 'how to code in python' -> OFF_TOPIC|null|null|null|false
                        - 'who is the president' -> OFF_TOPIC|null|null|null|false
                        - 'write me a poem' -> OFF_TOPIC|null|null|null|false
                        - '1+1=?' -> OFF_TOPIC|null|null|null|false
                        """,
                userMessage);

        String result = callGeminiApi(prompt);
        if (result == null)
            return "CHAT|null|null|null|false";
        return result.trim();
    }

    // =====================================================
    // HANDLE OFF_TOPIC MESSAGES - Polite rejection
    // =====================================================
    private String handleOffTopicMessage(String userMessage) {
        // Return polite response in both languages
        return "😊 I appreciate your question, but I'm specifically designed to help with our auction platform.\n\n" +
                "I can assist you with:\n" +
                "🔍 Searching for products\n" +
                "💰 Placing bids\n" +
                "📦 Checking your auctions\n" +
                "❓ Answering questions about how auctions work\n\n" +
                "How can I help you with your auction needs today?";
    }

    // Call Gemini API
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
                    return ((String) partMap.get("text")).trim();
                }
            }
            return "Sorry, I cannot process your request at this time.";
        } catch (Exception e) {
            e.printStackTrace();
            return "AI connection error: " + e.getMessage();
        }
    }
}