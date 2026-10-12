package com.shopsphere.service;

import com.shopsphere.dto.request.CartItemRequest;
import com.shopsphere.dto.response.CartItemResponse;
import com.shopsphere.dto.response.CartSummaryResponse;
import com.shopsphere.entity.CartItem;
import com.shopsphere.entity.Product;
import com.shopsphere.entity.User;
import com.shopsphere.exception.BadRequestException;
import com.shopsphere.exception.InsufficientStockException;
import com.shopsphere.exception.ResourceNotFoundException;
import com.shopsphere.repository.CartItemRepository;
import com.shopsphere.repository.ProductRepository;
import com.shopsphere.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    public CartService(CartItemRepository cartItemRepository,
                       ProductRepository productRepository,
                       UserRepository userRepository) {
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public CartSummaryResponse getCartSummary(Long userId) {
        List<CartItem> items = cartItemRepository.findByUserIdOrderByCreatedAtDesc(userId);

        List<CartItemResponse> responseItems = items.stream()
                .map(CartItemResponse::fromEntity)
                .collect(Collectors.toList());

        BigDecimal subtotal = BigDecimal.ZERO;
        int totalItemsCount = 0;
        boolean allInStock = true;

        for (CartItemResponse item : responseItems) {
            subtotal = subtotal.add(item.getLineTotal());
            totalItemsCount += item.getQuantity();
            if (!item.isInStock()) {
                allInStock = false;
            }
        }

        // Campus shipping policy: Free delivery on campus for orders above ₹499, else ₹40
        BigDecimal shippingFee = BigDecimal.ZERO;
        if (subtotal.compareTo(BigDecimal.ZERO) > 0 && subtotal.compareTo(BigDecimal.valueOf(499)) < 0) {
            shippingFee = BigDecimal.valueOf(40.00);
        }

        BigDecimal discount = BigDecimal.ZERO;
        BigDecimal total = subtotal.add(shippingFee).subtract(discount);

        return new CartSummaryResponse(
                responseItems,
                totalItemsCount,
                subtotal,
                shippingFee,
                discount,
                total,
                allInStock
        );
    }

    @Transactional
    public CartItemResponse addToCart(Long userId, CartItemRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", request.getProductId()));

        if (!product.isActive()) {
            throw new BadRequestException("This product is currently inactive and cannot be added to cart.");
        }

        if (product.getStockQuantity() <= 0) {
            throw new InsufficientStockException("Product '" + product.getName() + "' is out of stock.");
        }

        Optional<CartItem> existingItemOpt = cartItemRepository.findByUserIdAndProductId(userId, product.getId());

        CartItem item;
        if (existingItemOpt.isPresent()) {
            item = existingItemOpt.get();
            int newQuantity = item.getQuantity() + request.getQuantity();
            if (newQuantity > product.getStockQuantity()) {
                throw new InsufficientStockException(product.getName(), newQuantity, product.getStockQuantity());
            }
            item.setQuantity(newQuantity);
        } else {
            if (request.getQuantity() > product.getStockQuantity()) {
                throw new InsufficientStockException(product.getName(), request.getQuantity(), product.getStockQuantity());
            }
            item = new CartItem(user, product, request.getQuantity());
        }

        CartItem saved = cartItemRepository.save(item);
        return CartItemResponse.fromEntity(saved);
    }

    @Transactional
    public CartItemResponse updateQuantity(Long userId, Long cartItemId, int newQuantity) {
        if (newQuantity <= 0) {
            throw new BadRequestException("Quantity must be at least 1. Use remove to delete item.");
        }

        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + cartItemId));

        if (!item.getUser().getId().equals(userId)) {
            throw new BadRequestException("Cannot modify items belonging to another user's cart.");
        }

        Product product = item.getProduct();
        if (newQuantity > product.getStockQuantity()) {
            throw new InsufficientStockException(product.getName(), newQuantity, product.getStockQuantity());
        }

        item.setQuantity(newQuantity);
        CartItem saved = cartItemRepository.save(item);
        return CartItemResponse.fromEntity(saved);
    }

    @Transactional
    public void removeFromCart(Long userId, Long cartItemId) {
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new ResourceNotFoundException("Cart item not found with id: " + cartItemId));

        if (!item.getUser().getId().equals(userId)) {
            throw new BadRequestException("Cannot remove items belonging to another user's cart.");
        }

        cartItemRepository.delete(item);
    }

    @Transactional
    public void clearCart(Long userId) {
        cartItemRepository.deleteByUserId(userId);
    }
}
