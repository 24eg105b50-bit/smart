package com.shopsphere.service;

import com.shopsphere.dto.request.CreateOrderRequest;
import com.shopsphere.dto.response.OrderResponse;
import com.shopsphere.entity.*;
import com.shopsphere.enums.OrderStatus;
import com.shopsphere.enums.PaymentMethod;
import com.shopsphere.enums.PaymentStatus;
import com.shopsphere.enums.UserRole;
import com.shopsphere.exception.BadRequestException;
import com.shopsphere.exception.ResourceNotFoundException;
import com.shopsphere.repository.CartItemRepository;
import com.shopsphere.repository.OrderRepository;
import com.shopsphere.repository.ProductRepository;
import com.shopsphere.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AddressService addressService;

    @InjectMocks
    private OrderService orderService;

    private User sampleUser;
    private Address sampleAddress;
    private Product sampleProduct;

    @BeforeEach
    void setUp() {
        sampleUser = new User("Rohith", "student@test.edu", "hash", UserRole.CUSTOMER);
        sampleUser.setId(1L);

        sampleAddress = new Address(sampleUser, "Rohith", "9876543210", "Hostel 4", "Vizag", "AP", "530003", true);
        sampleAddress.setId(20L);

        Category category = new Category("Electronics", "electronics", "desc", "img");
        sampleProduct = new Product(category, "Arduino Uno", "arduino-uno", "desc", "Arduino", "ARD-01",
                new BigDecimal("1850.00"), 10, "img");
        sampleProduct.setId(100L);
    }

    @Test
    @DisplayName("Should create order, decrement product stock, and clear cart")
    void testCreateOrderSuccess() {
        CreateOrderRequest request = new CreateOrderRequest(20L, PaymentMethod.SIMULATED_UPI, "REF123");

        CartItem cartItem = new CartItem(sampleUser, sampleProduct, 2);
        cartItem.setId(5L);

        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(cartItemRepository.findByUserIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(cartItem));
        when(addressService.getAddressEntity(20L, 1L)).thenReturn(sampleAddress);
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        OrderResponse response = orderService.createOrder(1L, request);

        assertNotNull(response);
        assertEquals(new BigDecimal("3700.00"), response.getSubtotal());
        assertEquals(new BigDecimal("3700.00"), response.getTotalAmount());
        assertEquals(OrderStatus.PLACED, response.getOrderStatus());

        // Stock decreased from 10 to 8
        assertEquals(8, sampleProduct.getStockQuantity());
        verify(productRepository).save(sampleProduct);

        // Cart cleared
        verify(cartItemRepository).deleteByUserId(1L);
    }

    @Test
    @DisplayName("Should reject order creation when cart is empty")
    void testCreateOrderEmptyCart() {
        CreateOrderRequest request = new CreateOrderRequest(20L, PaymentMethod.SIMULATED_UPI, null);

        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(cartItemRepository.findByUserIdOrderByCreatedAtDesc(1L)).thenReturn(Collections.emptyList());

        assertThrows(BadRequestException.class, () -> orderService.createOrder(1L, request));
        verify(orderRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should allow cancelling a PLACED order and restore product stock")
    void testCancelPlacedOrderAndRestock() {
        Order order = new Order("SSC-123", sampleUser, "Rohith", "9876543210", "Hostel 4",
                new BigDecimal("1850.00"), BigDecimal.ZERO, BigDecimal.ZERO, new BigDecimal("1850.00"),
                PaymentMethod.SIMULATED_CARD, PaymentStatus.COMPLETED);
        order.setId(50L);

        OrderItem item = new OrderItem(order, sampleProduct, sampleProduct.getName(), sampleProduct.getSku(),
                sampleProduct.getPrice(), 2, new BigDecimal("3700.00"));
        order.addItem(item);

        when(orderRepository.findByIdAndUserId(50L, 1L)).thenReturn(Optional.of(order));
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Initial stock is 10
        sampleProduct.setStockQuantity(8);

        OrderResponse response = orderService.cancelOrder(50L, 1L);

        assertEquals(OrderStatus.CANCELLED, response.getOrderStatus());
        assertEquals(10, sampleProduct.getStockQuantity()); // Restored
        verify(productRepository).save(sampleProduct);
    }

    @Test
    @DisplayName("Should prevent customer from accessing or cancelling another customer's order")
    void testCustomerOrderOwnershipIsolation() {
        when(orderRepository.findByIdAndUserId(99L, 1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> orderService.getOrderByIdAndUser(99L, 1L));
    }
}
