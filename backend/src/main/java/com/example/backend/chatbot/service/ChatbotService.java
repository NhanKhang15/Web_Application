package com.example.backend.chatbot.service;

import com.example.backend.auction.domain.auction.dto.AuctionDto;
import com.example.backend.chatbot.dto.ChatRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.time.Duration;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
public class ChatbotService {

    private final String apiKey;
    private final String chatModel;
    private final double temperature;
    private final double topP;
    private final int topK;
    private final int maxOutputTokens;
    private final int historyMaxItems;

    @Autowired
    private ChatbotDataService chatbotDataService;

    @Autowired
    @Qualifier("geminiWebClient")
    private WebClient webClient;

    public ChatbotService(
            @Value("${gemini.api.key}") String apiKey,
            @Value("${gemini.model.chat}") String chatModel,
            @Value("${gemini.generation.temperature}") double temperature,
            @Value("${gemini.generation.top-p}") double topP,
            @Value("${gemini.generation.top-k}") int topK,
            @Value("${gemini.generation.max-output-tokens}") int maxOutputTokens,
            @Value("${chatbot.history.max-items:6}") int historyMaxItems) {
        this.apiKey = apiKey;
        this.chatModel = chatModel;
        this.temperature = temperature;
        this.topP = topP;
        this.topK = topK;
        this.maxOutputTokens = maxOutputTokens;
        this.historyMaxItems = historyMaxItems;

        log.info("ChatbotService initialized with model: {}, temperature: {}, maxTokens: {}",
                chatModel, temperature, maxOutputTokens);
    }

    // ==========================================
    // MAIN LOGIC - UPGRADED WITH PLACE_BID
    // ==========================================
    public String processUserMessage(ChatRequest request) {
        String userMessage = request.getMessage();
        List<ChatRequest.HistoryItem> history = request.getHistory();
        Integer userId = request.getUserId();
        ChatRequest.PendingBid pendingBid = request.getPendingBid();

        log.debug("Processing message for user {}: '{}'", userId,
                userMessage != null && userMessage.length() > 50
                        ? userMessage.substring(0, 50) + "..."
                        : userMessage);

        // 1. Build history context
        String historyContext = buildHistoryString(history);

        // =====================================================
        // HANDLE BID CONFIRMATION (if awaiting confirmation)
        // =====================================================
        log.info("PendingBid check - pendingBid: {}, awaitingConfirmation: {}",
                pendingBid != null ? "exists (auctionId=" + pendingBid.getAuctionId() + ")" : "null",
                pendingBid != null ? pendingBid.isAwaitingConfirmation() : "N/A");

        if (pendingBid != null && pendingBid.isAwaitingConfirmation()) {
            log.info("User {} confirming bid for auction {}", userId, pendingBid.getAuctionId());
            return handleBidConfirmation(userMessage, pendingBid, userId);
        }

        // 2. Analyze Intent
        String analysisResult = analyzeIntent(userMessage);
        String[] parts = analysisResult.split("\\|");
        String intent = parts[0].trim();
        String rawKeyword = parts.length > 1 ? parts[1].trim() : "";
        String keyword = (rawKeyword.equalsIgnoreCase("null")) ? "" : rawKeyword;

        log.info("Intent detected: {} for user {}", intent, userId);

        // System instruction in English - AI will respond in user's language
        String systemInstruction = """
                You are a professional auction platform AI assistant. Follow these rules:
                1. ALWAYS mention 'Current Price' and 'Next Minimum Bid'. Remind users not to bid lower than this.
                2. If you see [URGENT - CLOSING SOON] tag, use urgent tone to encourage immediate bidding.
                3. If 'Buy Now Price' is available, suggest the user can buy immediately without waiting.
                4. If the product belongs to the customer (noted in data), report the status to them.
                5. Do NOT use markdown formatting like **bold**. Keep responses concise and direct.
                6. CRITICAL FOR BIDDING: When guiding users to bid, use the LIST INDEX NUMBER (STT #1, #2, #3...) shown in the data, NOT the product name!
                   - For example: 'Bid 500000 for product #1' means the FIRST product in the list.
                   - NEVER use product names as the number. Always use the index (#1 = first item, #2 = second item, etc.)
                7. IMPORTANT: Always respond in the SAME LANGUAGE as the user's message.
                """;

        // =====================================================
        // HANDLE OFF_TOPIC INTENT - Politely reject unrelated questions
        // =====================================================
        if ("OFF_TOPIC".equalsIgnoreCase(intent)) {
            log.debug("Off-topic message detected from user {}", userId);
            return handleOffTopicMessage(userMessage);
        }

        // =====================================================
        // HANDLE PLACE_BID INTENT
        // =====================================================
        if ("PLACE_BID".equalsIgnoreCase(intent)) {
            log.info("Place bid intent from user {}", userId);
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
                log.debug("Could not parse price filters from intent");
            }

            log.info("Search intent - keyword: '{}', price: {}-{}, isMyItem: {}",
                    keyword, minPrice, maxPrice, isMyItem);

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

                            Provide advice based on the rules above.
                            IMPORTANT: When telling user how to bid, use the INDEX NUMBER (STT) like #1, #2, #3 from the list above, NOT the product name!
                            Example: If there's only 1 product, tell user: 'Bid [amount] cho sản phẩm #1' (NOT the product name).
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
            log.debug("Could not parse bid parameters");
        }

        // Check login
        if (userId == null) {
            log.warn("Unauthenticated user attempted to place bid");
            return "⚠️ You need to log in to place a bid. Please log in and try again.";
        }

        // Check email verified
        if (!chatbotDataService.isEmailVerified(userId)) {
            log.warn("User {} attempted to bid without email verification", userId);
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
            log.warn("User {} tried to bid on non-existent auction index {}", userId, auctionIndex);
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
            log.info("User {} bid {} is below minimum {} for auction {}",
                    userId, bidAmount, minNextBid, auction.getAuctionId());
            return String.format("❌ Bid must be at least %,.0f VND.\n" +
                    "📊 Current price: %,.0f VND\n" +
                    "📈 Bid step: %,.0f VND",
                    minNextBid, currentPrice, minStep);
        }

        // =====================================================
        // RETURN CONFIRMATION REQUEST (Frontend will save pendingBid)
        // =====================================================
        log.info("User {} requesting bid confirmation for auction {} amount {}",
                userId, auction.getAuctionId(), bidAmount);

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
            log.info("User {} confirmed bid for auction {}", userId, pendingBid.getAuctionId());

            // Execute bid
            String result = chatbotDataService.placeBidForUser(
                    userId,
                    pendingBid.getAuctionId(),
                    BigDecimal.valueOf(pendingBid.getBidAmount()));

            log.info("Bid result from placeBidForUser: '{}'", result);

            if (result.startsWith("THÀNH CÔNG")) {
                log.info("Bid placed successfully for user {} on auction {}", userId, pendingBid.getAuctionId());
                return "✅ " + result + "\n\n🎉 Good luck with your auction!";
            } else if (result.startsWith("LỖI_EMAIL")) {
                log.warn("Email verification error for user {}", userId);
                return "⚠️ " + result.replace("LỖI_EMAIL: ", "");
            } else {
                log.warn("Bid failed for user {}: {}", userId, result);
                return "❌ " + result.replace("LỖI: ", "");
            }
        } else if (isDenied) {
            log.info("User {} cancelled bid for auction {}", userId, pendingBid.getAuctionId());
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
        int start = Math.max(0, history.size() - historyMaxItems);

        for (int i = start; i < history.size(); i++) {
            var item = history.get(i);
            String role = "user".equals(item.getSender()) ? "Customer" : "Assistant";
            sb.append(role).append(": ").append(item.getText()).append("\n");
        }
        return sb.toString();
    }

    private String analyzeIntent(String userMessage) {
        log.debug("Analyzing intent for message: '{}'",
                userMessage != null && userMessage.length() > 30
                        ? userMessage.substring(0, 30) + "..."
                        : userMessage);

        String prompt = String.format(
                """
                        Analyze this message and output ONLY the intent format. NO explanations.

                        Message: "%s"

                        === OUTPUT FORMAT (return ONLY one of these, nothing else) ===
                        PLACE_BID|PRODUCT_NUMBER|AMOUNT
                        SEARCH|KEYWORD|MIN_PRICE|MAX_PRICE|IS_MINE
                        CHAT|null|null|null|false
                        OFF_TOPIC|null|null|null|false

                        === DETECTION RULES ===

                        PLACE_BID - User wants to bid on a product:
                        - "giá X cho sản phẩm Y" -> PLACE_BID|Y|X
                        - "đặt giá X cho sp Y" -> PLACE_BID|Y|X
                        - "bid X for product Y" -> PLACE_BID|Y|X
                        - "X cho sản phẩm #Y" -> PLACE_BID|Y|X
                        - "đặt X cho #Y" -> PLACE_BID|Y|X
                        - ANY message with amount + product number = PLACE_BID

                        SEARCH - User wants to find products:
                        - "tìm laptop", "find phone", "search for watch"
                        - "sản phẩm của tôi" -> SEARCH||null|null|true

                        CHAT - Greetings, thanks, auction questions:
                        - "hello", "thanks", "how does bidding work"

                        OFF_TOPIC - NOT about auctions:
                        - Coding, math, politics, personal advice

                        === EXAMPLES ===
                        "giá 200000000 cho sản phẩm 1" -> PLACE_BID|1|200000000
                        "200 triệu cho sp #1" -> PLACE_BID|1|200000000
                        "đặt 500k cho sản phẩm số 2" -> PLACE_BID|2|500000
                        "1tr cho #3" -> PLACE_BID|3|1000000
                        "bid 100 dollars on item 5" -> PLACE_BID|5|100
                        "tìm laptop" -> SEARCH|Laptop|null|null|false
                        "hello" -> CHAT|null|null|null|false
                        "solve 1+1" -> OFF_TOPIC|null|null|null|false

                        IMPORTANT: Output ONLY the format line. No explanations. No markdown.
                        """,
                userMessage);

        String result = callGeminiApi(prompt);
        if (result == null) {
            log.warn("Failed to analyze intent, defaulting to CHAT");
            return "CHAT|null|null|null|false";
        }

        // Validate and extract proper format
        String trimmed = result.trim();

        // Check if result starts with valid intent
        if (trimmed.startsWith("PLACE_BID|") ||
                trimmed.startsWith("SEARCH|") ||
                trimmed.startsWith("CHAT|") ||
                trimmed.startsWith("OFF_TOPIC|")) {

            // Extract only first line if there are multiple lines
            String intentLine = trimmed.split("\n")[0].trim();
            log.debug("Intent analysis result: {}", intentLine);
            return intentLine;
        }

        // If AI returned explanation instead of format, try to parse it
        log.warn("AI returned invalid format, attempting to parse: {}",
                trimmed.length() > 100 ? trimmed.substring(0, 100) + "..." : trimmed);

        // Check if it mentions PLACE_BID anywhere (AI might have explained it)
        if (trimmed.contains("PLACE_BID")) {
            // Try to extract PLACE_BID|X|Y pattern
            java.util.regex.Pattern pattern = java.util.regex.Pattern.compile("PLACE_BID\\|(\\d+)\\|(\\d+)");
            java.util.regex.Matcher matcher = pattern.matcher(trimmed);
            if (matcher.find()) {
                String extracted = matcher.group();
                log.info("Extracted PLACE_BID intent: {}", extracted);
                return extracted;
            }
        }

        // Default to CHAT if we can't parse
        log.warn("Could not parse intent, defaulting to CHAT");
        return "CHAT|null|null|null|false";
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

    // Call Gemini API using WebClient
    private String callGeminiApi(String prompt) {
        String url = String.format("/models/%s:generateContent?key=%s", chatModel, apiKey);

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

        try {
            long startTime = System.currentTimeMillis();

            Map response = webClient.post()
                    .uri(url)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .timeout(Duration.ofSeconds(30))
                    .block();

            long duration = System.currentTimeMillis() - startTime;
            log.debug("Gemini API call completed in {}ms", duration);

            if (response != null && response.containsKey("candidates")) {
                List candidates = (List) response.get("candidates");
                if (!candidates.isEmpty()) {
                    Map candidate = (Map) candidates.get(0);
                    Map contentMap = (Map) candidate.get("content");
                    List parts = (List) contentMap.get("parts");
                    Map partMap = (Map) parts.get(0);
                    return ((String) partMap.get("text")).trim();
                }
            }

            log.warn("Gemini API returned no candidates");
            return "Sorry, I cannot process your request at this time.";

        } catch (WebClientResponseException e) {
            log.error("Gemini API HTTP error: {} - {}", e.getStatusCode(), e.getResponseBodyAsString());
            return "AI connection error. Please try again later.";
        } catch (Exception e) {
            log.error("Gemini API error: {}", e.getMessage(), e);
            return "AI connection error: " + e.getMessage();
        }
    }
}