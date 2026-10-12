package com.shopsphere.controller;

import com.shopsphere.dto.request.AiChatRequest;
import com.shopsphere.dto.response.AiChatResponse;
import com.shopsphere.dto.response.ApiResponse;
import com.shopsphere.dto.response.ChatMessageResponse;
import com.shopsphere.dto.response.ChatSessionResponse;
import com.shopsphere.security.UserPrincipal;
import com.shopsphere.service.AiAssistantService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
@Tag(name = "AI Assistant", description = "Endpoints for AI-powered shopping assistance and conversational discovery")
public class AiController {

    private final AiAssistantService aiAssistantService;

    public AiController(AiAssistantService aiAssistantService) {
        this.aiAssistantService = aiAssistantService;
    }

    @PostMapping("/chat")
    @Operation(summary = "Send a natural language query to the AI Shopping Assistant")
    public ResponseEntity<ApiResponse<AiChatResponse>> chat(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody AiChatRequest request) {
        AiChatResponse response = aiAssistantService.processChat(principal.getId(), request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/sessions")
    @Operation(summary = "Get user's previous AI chat sessions")
    public ResponseEntity<ApiResponse<List<ChatSessionResponse>>> getSessions(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<ChatSessionResponse> sessions = aiAssistantService.getUserSessions(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(sessions));
    }

    @GetMapping("/sessions/{id}/messages")
    @Operation(summary = "Get message history for a specific AI chat session")
    public ResponseEntity<ApiResponse<List<ChatMessageResponse>>> getSessionMessages(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long id) {
        List<ChatMessageResponse> messages = aiAssistantService.getSessionMessages(id, principal.getId());
        return ResponseEntity.ok(ApiResponse.success(messages));
    }
}
