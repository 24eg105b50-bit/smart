package com.shopsphere.dto.response;

import com.shopsphere.entity.CartItem;
import java.math.BigDecimal;

public class CartItemResponse {

    private Long id;
    private Long productId;
    private String productName;
    private String productSlug;
    private String productBrand;
    private String productSku;
    private String productImageUrl;
    private BigDecimal unitPrice;
    private Integer availableStock;
    private Integer quantity;
    private BigDecimal lineTotal;
    private boolean inStock;

    public CartItemResponse() {
    }

    public static CartItemResponse fromEntity(CartItem item) {
        if (item == null || item.getProduct() == null) return null;
        CartItemResponse resp = new CartItemResponse();
        resp.setId(item.getId());
        resp.setProductId(item.getProduct().getId());
        resp.setProductName(item.getProduct().getName());
        resp.setProductSlug(item.getProduct().getSlug());
        resp.setProductBrand(item.getProduct().getBrand());
        resp.setProductSku(item.getProduct().getSku());
        resp.setProductImageUrl(item.getProduct().getImageUrl());
        resp.setUnitPrice(item.getProduct().getPrice());
        resp.setAvailableStock(item.getProduct().getStockQuantity());
        resp.setQuantity(item.getQuantity());
        resp.setInStock(item.getProduct().getStockQuantity() >= item.getQuantity() && item.getProduct().isActive());
        resp.setLineTotal(item.getProduct().getPrice().multiply(BigDecimal.valueOf(item.getQuantity())));
        return resp;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getProductSlug() {
        return productSlug;
    }

    public void setProductSlug(String productSlug) {
        this.productSlug = productSlug;
    }

    public String getProductBrand() {
        return productBrand;
    }

    public void setProductBrand(String productBrand) {
        this.productBrand = productBrand;
    }

    public String getProductSku() {
        return productSku;
    }

    public void setProductSku(String productSku) {
        this.productSku = productSku;
    }

    public String getProductImageUrl() {
        return productImageUrl;
    }

    public void setProductImageUrl(String productImageUrl) {
        this.productImageUrl = productImageUrl;
    }

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }

    public Integer getAvailableStock() {
        return availableStock;
    }

    public void setAvailableStock(Integer availableStock) {
        this.availableStock = availableStock;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public BigDecimal getLineTotal() {
        return lineTotal;
    }

    public void setLineTotal(BigDecimal lineTotal) {
        this.lineTotal = lineTotal;
    }

    public boolean isInStock() {
        return inStock;
    }

    public void setInStock(boolean inStock) {
        this.inStock = inStock;
    }
}
