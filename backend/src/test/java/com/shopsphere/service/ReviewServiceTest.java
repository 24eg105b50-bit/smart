package com.shopsphere.service;

import com.shopsphere.dto.request.ReviewRequest;
import com.shopsphere.dto.response.ReviewResponse;
import com.shopsphere.entity.Category;
import com.shopsphere.entity.Product;
import com.shopsphere.entity.Review;
import com.shopsphere.entity.User;
import com.shopsphere.enums.UserRole;
import com.shopsphere.exception.BadRequestException;
import com.shopsphere.repository.OrderRepository;
import com.shopsphere.repository.ProductRepository;
import com.shopsphere.repository.ReviewRepository;
import com.shopsphere.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ReviewServiceTest {

    @Mock
    private ReviewRepository reviewRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private OrderRepository orderRepository;

    @InjectMocks
    private ReviewService reviewService;

    private User sampleUser;
    private Product sampleProduct;

    @BeforeEach
    void setUp() {
        sampleUser = new User("Rohith", "student@test.edu", "hash", UserRole.CUSTOMER);
        sampleUser.setId(1L);

        Category category = new Category("Audio", "audio", "desc", "img");
        sampleProduct = new Product(category, "Sony Headphones", "sony-headphones", "desc", "Sony", "SNY-01",
                new BigDecimal("19990.00"), 5, "img");
        sampleProduct.setId(10L);
    }

    @Test
    @DisplayName("Should successfully submit review when purchase is verified and recalculate rating")
    void testVerifiedPurchaseReviewSuccess() {
        ReviewRequest request = new ReviewRequest(10L, 5, "Amazing sound and active noise cancellation!");

        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(productRepository.findById(10L)).thenReturn(Optional.of(sampleProduct));
        when(reviewRepository.existsByUserIdAndProductId(1L, 10L)).thenReturn(false);
        when(orderRepository.hasPurchasedAndDelivered(1L, 10L)).thenReturn(true);

        Review savedReview = new Review(sampleUser, sampleProduct, 5, request.getComment());
        savedReview.setId(100L);
        when(reviewRepository.save(any(Review.class))).thenReturn(savedReview);
        when(reviewRepository.calculateAverageRating(10L)).thenReturn(5.0);
        when(reviewRepository.countByProductId(10L)).thenReturn(1L);

        ReviewResponse response = reviewService.addReview(1L, request);

        assertNotNull(response);
        assertEquals(5, response.getRating());
        assertEquals("Amazing sound and active noise cancellation!", response.getComment());

        // Product rating recalculated
        assertEquals(new BigDecimal("5.00"), sampleProduct.getAverageRating());
        assertEquals(1, sampleProduct.getReviewCount());
        verify(productRepository).save(sampleProduct);
    }

    @Test
    @DisplayName("Should reject review when student has not received delivery of the product")
    void testUnverifiedPurchaseReviewRejection() {
        ReviewRequest request = new ReviewRequest(10L, 5, "Trying to review without buying");

        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(productRepository.findById(10L)).thenReturn(Optional.of(sampleProduct));
        when(reviewRepository.existsByUserIdAndProductId(1L, 10L)).thenReturn(false);
        when(orderRepository.hasPurchasedAndDelivered(1L, 10L)).thenReturn(false);

        BadRequestException ex = assertThrows(BadRequestException.class, () -> reviewService.addReview(1L, request));
        assertTrue(ex.getMessage().contains("Only verified buyers"));

        verify(reviewRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should reject duplicate review for same product by same student")
    void testDuplicateReviewRejection() {
        ReviewRequest request = new ReviewRequest(10L, 4, "Second review attempt");

        when(userRepository.findById(1L)).thenReturn(Optional.of(sampleUser));
        when(productRepository.findById(10L)).thenReturn(Optional.of(sampleProduct));
        when(reviewRepository.existsByUserIdAndProductId(1L, 10L)).thenReturn(true);

        BadRequestException ex = assertThrows(BadRequestException.class, () -> reviewService.addReview(1L, request));
        assertTrue(ex.getMessage().contains("already reviewed"));
    }
}
