package com.shopsphere.dto.response;

import java.math.BigDecimal;
import java.util.List;

public class CartSummaryResponse {

    private List<CartItemResponse> items;
    private Integer totalItems;
    private BigDecimal subtotal;
    private BigDecimal estimatedShipping;
    private BigDecimal estimatedDiscount;
    private BigDecimal estimatedTotal;
    private boolean allItemsInStock;

    public CartSummaryResponse() {
    }

    public CartSummaryResponse(List<CartItemResponse> items, Integer totalItems, BigDecimal subtotal,
                               BigDecimal estimatedShipping, BigDecimal estimatedDiscount,
                               BigDecimal estimatedTotal, boolean allItemsInStock) {
        this.items = items;
        this.totalItems = totalItems;
        this.subtotal = subtotal;
        this.estimatedShipping = estimatedShipping;
        this.estimatedDiscount = estimatedDiscount;
        this.estimatedTotal = estimatedTotal;
        this.allItemsInStock = allItemsInStock;
    }

    public List<CartItemResponse> getItems() {
        return items;
    }

    public void setItems(List<CartItemResponse> items) {
        this.items = items;
    }

    public Integer getTotalItems() {
        return totalItems;
    }

    public void setTotalItems(Integer totalItems) {
        this.totalItems = totalItems;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public BigDecimal getEstimatedShipping() {
        return estimatedShipping;
    }

    public void setEstimatedShipping(BigDecimal estimatedShipping) {
        this.estimatedShipping = estimatedShipping;
    }

    public BigDecimal getEstimatedDiscount() {
        return estimatedDiscount;
    }

    public void setEstimatedDiscount(BigDecimal estimatedDiscount) {
        this.estimatedDiscount = estimatedDiscount;
    }

    public BigDecimal getEstimatedTotal() {
        return estimatedTotal;
    }

    public void setEstimatedTotal(BigDecimal estimatedTotal) {
        this.estimatedTotal = estimatedTotal;
    }

    public boolean isAllItemsInStock() {
        return allItemsInStock;
    }

    public void setAllItemsInStock(boolean allItemsInStock) {
        this.allItemsInStock = allItemsInStock;
    }
}
