package com.shopsphere.service;

import com.shopsphere.dto.request.CartItemRequest;
import com.shopsphere.dto.response.CartItemResponse;
import com.shopsphere.dto.response.CartSummaryResponse;
import com.shopsphere.entity.CartItem;
import com.shopsphere.entity.Category;
import com.shopsphere.entity.Product;
import com.shopsphere.entity.User;
import com.shopsphere.enums.UserRole;
import com.shopsphere.exception.BadRequestException;
import com.shopsphere.exception.InsufficientStockException;
import com.shopsphere.repository.CartItemRepository;
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
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private CartService cartService;

    private User sampleUser;
    private Product inStockProduct;
    private Product outOfStockProduct;

    @BeforeEach
    void setUp() {
        sampleUser = new User("Rohith", "student@test.edu", "hash", UserRole.CUSTOMER);
        sampleUser.setId(1L);

        Category category = new Category("Peripherals", "peripherals", "desc", "img");
        category.setId(10L);

        inStockProduct = new Product(category, "Keychron K2", "keychron-k2", "desc", "Keychron", "KEY-K2",
                new BigDecimal("6999.00"), 10, "img");
        inStockProduct.setId(100L);

        outOfStockProduct = new Product(category, "Soldout Mouse", "soldout-mouse", "desc", "Brand", "MOU-01",
                new BigDecimal("999.00"), 0, "img");
        outOfStockProduct.setId(101L);
    }

    @Test
    @DisplayName("Should successfully add product to cart and compute line total")
    void testAddToCartSuccess() {
        CartItemRequest request = new CartItemRequest(100L, 2);

        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(productRepository.findById(100L)).thenReturn(Optional.of(inStockProduct));
        when(cartItemRepository.findByUserIdAndProductId(1L, 100L)).thenReturn(Optional.empty());

        CartItem savedItem = new CartItem(sampleUser, inStockProduct, 2);
        savedItem.setId(50L);
        when(cartItemRepository.save(any(CartItem.class))).thenReturn(savedItem);

        CartItemResponse response = cartService.addToCart(1L, request);

        assertNotNull(response);
        assertEquals(2, response.getQuantity());
        assertEquals(new BigDecimal("13998.00"), response.getLineTotal());
    }

    @Test
    @DisplayName("Should throw InsufficientStockException when adding out of stock product")
    void testAddOutOfStockProduct() {
        CartItemRequest request = new CartItemRequest(101L, 1);

        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(productRepository.findById(101L)).thenReturn(Optional.of(outOfStockProduct));

        assertThrows(InsufficientStockException.class, () -> cartService.addToCart(1L, request));
        verify(cartItemRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should throw InsufficientStockException when requested quantity exceeds available stock")
    void testAddQuantityExceedingStock() {
        CartItemRequest request = new CartItemRequest(100L, 15); // Available is 10

        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(productRepository.findById(100L)).thenReturn(Optional.of(inStockProduct));

        assertThrows(InsufficientStockException.class, () -> cartService.addToCart(1L, request));
    }

    @Test
    @DisplayName("Should calculate correct subtotal and campus free shipping above threshold")
    void testCartSummaryCalculation() {
        CartItem item = new CartItem(sampleUser, inStockProduct, 1); // 6999.00
        when(cartItemRepository.findByUserIdOrderByCreatedAtDesc(1L)).thenReturn(List.of(item));

        CartSummaryResponse summary = cartService.getCartSummary(1L);

        assertEquals(new BigDecimal("6999.00"), summary.getSubtotal());
        assertEquals(BigDecimal.ZERO, summary.getEstimatedShipping()); // Free delivery above 499
        assertEquals(new BigDecimal("6999.00"), summary.getEstimatedTotal());
    }
}
