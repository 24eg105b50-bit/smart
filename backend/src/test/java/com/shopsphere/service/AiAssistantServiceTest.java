package com.shopsphere.service;

import com.shopsphere.dto.request.AiChatRequest;
import com.shopsphere.dto.response.AiChatResponse;
import com.shopsphere.entity.*;
import com.shopsphere.enums.UserRole;
import com.shopsphere.repository.ChatMessageRepository;
import com.shopsphere.repository.ChatSessionRepository;
import com.shopsphere.repository.ProductRepository;
import com.shopsphere.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AiAssistantServiceTest {

    @Mock
    private ChatSessionRepository chatSessionRepository;

    @Mock
    private ChatMessageRepository chatMessageRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private RagPolicyService ragPolicyService;

    @InjectMocks
    private AiAssistantService aiAssistantService;

    private User sampleUser;
    private Product laptopProduct;

    @BeforeEach
    void setUp() {
        sampleUser = new User("Rohith", "student@test.edu", "hash", UserRole.CUSTOMER);
        sampleUser.setId(1L);

        Category category = new Category("Laptops", "laptops", "desc", "img");
        laptopProduct = new Product(category, "ThinkPad E14", "thinkpad-e14", "Laptop for coding",
                "Lenovo", "LEN-01", new BigDecimal("54990.00"), 10, "img");
        laptopProduct.setId(50L);
    }

    @Test
    @DisplayName("Should ground AI recommendations in actual database products and identify budget constraint")
    void testGroundedCatalogRecommendations() {
        AiChatRequest request = new AiChatRequest(null, "I need a laptop for Java coding under 60000");

        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));

        ChatSession session = new ChatSession(sampleUser, "I need a laptop...");
        session.setId(10L);
        when(chatSessionRepository.save(any(ChatSession.class))).thenReturn(session);

        when(productRepository.filterCatalog(isNull(), isNull(), eq(new BigDecimal("60000")), eq("laptop"), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(laptopProduct)));

        when(ragPolicyService.retrieveRelevantPolicies(anyString())).thenReturn(List.of("Free Delivery: Over ₹499"));

        AiChatResponse response = aiAssistantService.processChat(1L, request);

        assertNotNull(response);
        assertEquals(10L, response.getSessionId());
        assertTrue(response.isFallbackMode()); // No external API key provided
        assertFalse(response.getRecommendedProducts().isEmpty());
        assertEquals("ThinkPad E14", response.getRecommendedProducts().get(0).getName());
        assertEquals(new BigDecimal("54990.00"), response.getRecommendedProducts().get(0).getPrice());
        assertTrue(response.getReply().contains("ThinkPad E14"));
        assertFalse(response.getSourceReferences().isEmpty());

        verify(chatMessageRepository, times(2)).save(any(ChatMessage.class));
    }
}
