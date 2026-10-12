package com.shopsphere.dto.response;

import com.shopsphere.entity.ChatMessage;
import java.time.LocalDateTime;

public class ChatMessageResponse {

    private Long id;
    private Long sessionId;
    private String sender;
    private String message;
    private LocalDateTime createdAt;

    public ChatMessageResponse() {
    }

    public ChatMessageResponse(Long id, Long sessionId, String sender, String message, LocalDateTime createdAt) {
        this.id = id;
        this.sessionId = sessionId;
        this.sender = sender;
        this.message = message;
        this.createdAt = createdAt;
    }

    public static ChatMessageResponse fromEntity(ChatMessage msg) {
        if (msg == null) return null;
        return new ChatMessageResponse(
                msg.getId(),
                msg.getSession() != null ? msg.getSession().getId() : null,
                msg.getSender(),
                msg.getMessage(),
                msg.getCreatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getSessionId() {
        return sessionId;
    }

    public void setSessionId(Long sessionId) {
        this.sessionId = sessionId;
    }

    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
