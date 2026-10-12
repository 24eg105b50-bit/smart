package com.shopsphere.service;

import com.shopsphere.dto.response.DashboardStatsResponse;
import com.shopsphere.dto.response.OrderResponse;
import com.shopsphere.dto.response.ProductResponse;
import com.shopsphere.entity.Product;
import com.shopsphere.enums.OrderStatus;
import com.shopsphere.enums.UserRole;
import com.shopsphere.repository.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminDashboardService {

    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;

    public AdminDashboardService(ProductRepository productRepository,
                                 UserRepository userRepository,
                                 OrderRepository orderRepository,
                                 OrderItemRepository orderItemRepository) {
        this.productRepository = productRepository;
        this.userRepository = userRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
    }

    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats() {
        DashboardStatsResponse stats = new DashboardStatsResponse();

        stats.setTotalProducts(productRepository.countByActiveTrue());
        stats.setTotalCustomers(userRepository.countByRole(UserRole.CUSTOMER));
        stats.setTotalOrders(orderRepository.count());

        long placed = orderRepository.countByOrderStatus(OrderStatus.PLACED);
        long confirmed = orderRepository.countByOrderStatus(OrderStatus.CONFIRMED);
        long shipped = orderRepository.countByOrderStatus(OrderStatus.SHIPPED);
        long delivered = orderRepository.countByOrderStatus(OrderStatus.DELIVERED);
        long cancelled = orderRepository.countByOrderStatus(OrderStatus.CANCELLED);

        stats.setPendingOrders(placed + confirmed);
        stats.setCompletedOrders(delivered);
        stats.setLowStockProductsCount(productRepository.countByStockQuantityLessThanEqual(5));

        BigDecimal totalRevenue = orderRepository.calculateTotalRevenue();
        stats.setTotalRevenue(totalRevenue != null ? totalRevenue : BigDecimal.ZERO);

        // Recent orders
        List<OrderResponse> recentOrders = orderRepository.findRecentOrders(PageRequest.of(0, 6)).stream()
                .map(OrderResponse::fromEntity)
                .collect(Collectors.toList());
        stats.setRecentOrders(recentOrders);

        // Low stock products
        List<Product> lowStock = productRepository.findByActiveTrueAndStockQuantityLessThanEqual(5);
        stats.setLowStockProducts(lowStock.stream().map(ProductResponse::fromEntity).collect(Collectors.toList()));

        // Order Status chart data
        List<Map<String, Object>> statusData = new ArrayList<>();
        statusData.add(createStatusMap("Placed", placed));
        statusData.add(createStatusMap("Confirmed", confirmed));
        statusData.add(createStatusMap("Shipped", shipped));
        statusData.add(createStatusMap("Delivered", delivered));
        statusData.add(createStatusMap("Cancelled", cancelled));
        stats.setSalesByStatus(statusData);

        // Top selling products
        List<Object[]> topSold = orderItemRepository.findTopSellingProducts(PageRequest.of(0, 5));
        List<Map<String, Object>> topSellingList = new ArrayList<>();
        for (Object[] row : topSold) {
            Map<String, Object> itemMap = new HashMap<>();
            itemMap.put("productName", row[0]);
            itemMap.put("soldCount", row[1]);
            topSellingList.add(itemMap);
        }
        stats.setTopSellingProducts(topSellingList);

        return stats;
    }

    private Map<String, Object> createStatusMap(String status, long count) {
        Map<String, Object> map = new HashMap<>();
        map.put("name", status);
        map.put("count", count);
        return map;
    }
}
