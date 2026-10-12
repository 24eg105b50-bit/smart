package com.shopsphere.repository;

import com.shopsphere.entity.OrderItem;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
    List<OrderItem> findByOrderId(Long orderId);

    @Query("SELECT i.productNameSnapshot as productName, SUM(i.quantity) as totalSold " +
           "FROM OrderItem i JOIN i.order o WHERE o.orderStatus <> 'CANCELLED' " +
           "GROUP BY i.productNameSnapshot ORDER BY SUM(i.quantity) DESC")
    List<Object[]> findTopSellingProducts(Pageable pageable);
}
