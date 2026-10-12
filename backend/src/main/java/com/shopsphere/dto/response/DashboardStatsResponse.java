package com.shopsphere.dto.response;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public class DashboardStatsResponse {

    private Long totalProducts;
    private Long totalCustomers;
    private Long totalOrders;
    private Long pendingOrders;
    private Long completedOrders;
    private Long lowStockProductsCount;
    private BigDecimal totalRevenue;
    private List<OrderResponse> recentOrders;
    private List<ProductResponse> lowStockProducts;
    private List<Map<String, Object>> salesByStatus;
    private List<Map<String, Object>> topSellingProducts;

    public DashboardStatsResponse() {
    }

    public Long getTotalProducts() {
        return totalProducts;
    }

    public void setTotalProducts(Long totalProducts) {
        this.totalProducts = totalProducts;
    }

    public Long getTotalCustomers() {
        return totalCustomers;
    }

    public void setTotalCustomers(Long totalCustomers) {
        this.totalCustomers = totalCustomers;
    }

    public Long getTotalOrders() {
        return totalOrders;
    }

    public void setTotalOrders(Long totalOrders) {
        this.totalOrders = totalOrders;
    }

    public Long getPendingOrders() {
        return pendingOrders;
    }

    public void setPendingOrders(Long pendingOrders) {
        this.pendingOrders = pendingOrders;
    }

    public Long getCompletedOrders() {
        return completedOrders;
    }

    public void setCompletedOrders(Long completedOrders) {
        this.completedOrders = completedOrders;
    }

    public Long getLowStockProductsCount() {
        return lowStockProductsCount;
    }

    public void setLowStockProductsCount(Long lowStockProductsCount) {
        this.lowStockProductsCount = lowStockProductsCount;
    }

    public BigDecimal getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(BigDecimal totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public List<OrderResponse> getRecentOrders() {
        return recentOrders;
    }

    public void setRecentOrders(List<OrderResponse> recentOrders) {
        this.recentOrders = recentOrders;
    }

    public List<ProductResponse> getLowStockProducts() {
        return lowStockProducts;
    }

    public void setLowStockProducts(List<ProductResponse> lowStockProducts) {
        this.lowStockProducts = lowStockProducts;
    }

    public List<Map<String, Object>> getSalesByStatus() {
        return salesByStatus;
    }

    public void setSalesByStatus(List<Map<String, Object>> salesByStatus) {
        this.salesByStatus = salesByStatus;
    }

    public List<Map<String, Object>> getTopSellingProducts() {
        return topSellingProducts;
    }

    public void setTopSellingProducts(List<Map<String, Object>> topSellingProducts) {
        this.topSellingProducts = topSellingProducts;
    }
}
