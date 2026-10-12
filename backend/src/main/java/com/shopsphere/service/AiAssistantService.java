package com.shopsphere.service;

import com.shopsphere.dto.request.AiChatRequest;
import com.shopsphere.dto.response.AiChatResponse;
import com.shopsphere.dto.response.ChatMessageResponse;
import com.shopsphere.dto.response.ChatSessionResponse;
import com.shopsphere.dto.response.ProductResponse;
import com.shopsphere.entity.ChatMessage;
import com.shopsphere.entity.ChatSession;
import com.shopsphere.entity.Product;
import com.shopsphere.entity.User;
import com.shopsphere.exception.ResourceNotFoundException;
import com.shopsphere.repository.ChatMessageRepository;
import com.shopsphere.repository.ChatSessionRepository;
import com.shopsphere.repository.ProductRepository;
import com.shopsphere.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class AiAssistantService {

    private static final Logger log = LoggerFactory.getLogger(AiAssistantService.class);

    private final ChatSessionRepository chatSessionRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final RagPolicyService ragPolicyService;

    @Value("${app.ai.api-key:}")
    private String apiKey;

    public AiAssistantService(ChatSessionRepository chatSessionRepository,
                              ChatMessageRepository chatMessageRepository,
                              UserRepository userRepository,
                              ProductRepository productRepository,
                              RagPolicyService ragPolicyService) {
        this.chatSessionRepository = chatSessionRepository;
        this.chatMessageRepository = chatMessageRepository;
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.ragPolicyService = ragPolicyService;
    }

    @Transactional
    public AiChatResponse processChat(Long userId, AiChatRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // 1. Get or create chat session
        ChatSession session;
        if (request.getSessionId() != null) {
            session = chatSessionRepository.findByIdAndUserId(request.getSessionId(), userId)
                    .orElseGet(() -> createNewSession(user, request.getMessage()));
        } else {
            session = createNewSession(user, request.getMessage());
        }

        // 2. Persist student message
        ChatMessage userMsg = new ChatMessage(session, "USER", request.getMessage());
        chatMessageRepository.save(userMsg);

        // 3. Grounded Catalog Querying & Budget Extraction
        BigDecimal extractedBudget = extractBudget(request.getMessage());
        List<Product> matchedProducts = findGroundedProducts(request.getMessage(), extractedBudget);

        // 4. Policy grounding (RAG)
        List<String> matchedPolicies = ragPolicyService.retrieveRelevantPolicies(request.getMessage());

        // 5. Generate grounded response
        String replyText = buildGroundedResponse(user.getFullName(), request.getMessage(), matchedProducts, matchedPolicies, extractedBudget);

        // 6. Persist assistant reply
        ChatMessage assistantMsg = new ChatMessage(session, "ASSISTANT", replyText);
        chatMessageRepository.save(assistantMsg);

        List<ProductResponse> productResponses = matchedProducts.stream()
                .limit(4)
                .map(ProductResponse::fromEntity)
                .collect(Collectors.toList());

        boolean isFallbackMode = apiKey == null || apiKey.isBlank();

        return new AiChatResponse(
                session.getId(),
                replyText,
                productResponses,
                matchedPolicies,
                isFallbackMode
        );
    }

    @Transactional(readOnly = true)
    public List<ChatSessionResponse> getUserSessions(Long userId) {
        return chatSessionRepository.findByUserIdOrderByUpdatedAtDesc(userId).stream()
                .map(ChatSessionResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ChatMessageResponse> getSessionMessages(Long sessionId, Long userId) {
        // Verify ownership
        chatSessionRepository.findByIdAndUserId(sessionId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Chat session not found with id: " + sessionId));

        return chatMessageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId).stream()
                .map(ChatMessageResponse::fromEntity)
                .collect(Collectors.toList());
    }

    private ChatSession createNewSession(User user, String initialMessage) {
        String title = initialMessage.length() > 40
                ? initialMessage.substring(0, 37) + "..."
                : initialMessage;
        ChatSession session = new ChatSession(user, title);
        return chatSessionRepository.save(session);
    }

    private BigDecimal extractBudget(String text) {
        Pattern pattern = Pattern.compile("(?:under|below|budget of|less than|max|₹|rs\\.?)\\s*(\\d+(?:,\\d+)?)", Pattern.CASE_INSENSITIVE);
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            try {
                String numStr = matcher.group(1).replace(",", "");
                return new BigDecimal(numStr);
            } catch (Exception ignored) {
            }
        }
        return null;
    }

    private List<Product> findGroundedProducts(String query, BigDecimal maxBudget) {
        String[] keywords = {"laptop", "keyboard", "mouse", "headphone", "audio", "book", "calculator",
                "notebook", "arduino", "raspberry", "pen", "stand", "monitor", "cable", "ssd", "ram"};

        String targetKeyword = "";
        String lower = query.toLowerCase();
        for (String kw : keywords) {
            if (lower.contains(kw)) {
                targetKeyword = kw;
                break;
            }
        }

        List<Product> products;
        if (!targetKeyword.isEmpty()) {
            products = productRepository.filterCatalog(null, null, maxBudget, targetKeyword, PageRequest.of(0, 6)).getContent();
        } else {
            products = productRepository.filterCatalog(null, null, maxBudget, query, PageRequest.of(0, 6)).getContent();
        }

        // If specific keyword had no match, fallback to general active products
        if (products.isEmpty() && maxBudget != null) {
            products = productRepository.filterCatalog(null, null, maxBudget, null, PageRequest.of(0, 4)).getContent();
        }

        return products;
    }

    private String buildGroundedResponse(String studentName, String query, List<Product> products, List<String> policies, BigDecimal budget) {
        StringBuilder sb = new StringBuilder();
        sb.append("Hello ").append(studentName != null ? studentName : "there").append("! ");

        if (!products.isEmpty()) {
            sb.append("Based on the ShopSphere Campus catalog, here are verified options matching your requirements");
            if (budget != null) {
                sb.append(" within your budget of ₹").append(budget);
            }
            sb.append(":\n\n");

            for (int i = 0; i < Math.min(products.size(), 3); i++) {
                Product p = products.get(i);
                sb.append("• **").append(p.getName()).append("** (Brand: ").append(p.getBrand())
                        .append(") — ₹").append(p.getPrice())
                        .append(" | ").append(p.getStockQuantity() > 0 ? p.getStockQuantity() + " units available in campus store" : "Currently Out of Stock")
                        .append("\n");
            }

            sb.append("\nYou can click directly on any of the product cards below to view complete specifications or add them to your cart.");
        } else {
            sb.append("I searched our campus inventory for '").append(query).append("'");
            if (budget != null) {
                sb.append(" within ₹").append(budget);
            }
            sb.append(", but could not find a direct match currently in stock. Would you like to explore related categories like Laptops, Computer Accessories, or Engineering Books?");
        }

        if (!policies.isEmpty()) {
            sb.append("\n\n**Campus Store Information:**\n");
            for (String pol : policies) {
                sb.append("ℹ️ ").append(pol).append("\n");
            }
        }

        return sb.toString();
    }
}
