package com.shopsphere.dto.response;

import java.util.ArrayList;
import java.util.List;

public class AiChatResponse {

    private Long sessionId;
    private String reply;
    private List<ProductResponse> recommendedProducts = new ArrayList<>();
    private List<String> sourceReferences = new ArrayList<>();
    private boolean fallbackMode;

    public AiChatResponse() {
    }

    public AiChatResponse(Long sessionId, String reply, List<ProductResponse> recommendedProducts,
                          List<String> sourceReferences, boolean fallbackMode) {
        this.sessionId = sessionId;
        this.reply = reply;
        this.recommendedProducts = recommendedProducts != null ? recommendedProducts : new ArrayList<>();
        this.sourceReferences = sourceReferences != null ? sourceReferences : new ArrayList<>();
        this.fallbackMode = fallbackMode;
    }

    public Long getSessionId() {
        return sessionId;
    }

    public void setSessionId(Long sessionId) {
        this.sessionId = sessionId;
    }

    public String getReply() {
        return reply;
    }

    public void setReply(String reply) {
        this.reply = reply;
    }

    public List<ProductResponse> getRecommendedProducts() {
        return recommendedProducts;
    }

    public void setRecommendedProducts(List<ProductResponse> recommendedProducts) {
        this.recommendedProducts = recommendedProducts;
    }

    public List<String> getSourceReferences() {
        return sourceReferences;
    }

    public void setSourceReferences(List<String> sourceReferences) {
        this.sourceReferences = sourceReferences;
    }

    public boolean isFallbackMode() {
        return fallbackMode;
    }

    public void setFallbackMode(boolean fallbackMode) {
        this.fallbackMode = fallbackMode;
    }
}
