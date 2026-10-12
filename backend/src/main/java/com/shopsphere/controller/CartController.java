package com.shopsphere.controller;

import com.shopsphere.dto.request.CartItemRequest;
import com.shopsphere.dto.response.ApiResponse;
import com.shopsphere.dto.response.CartItemResponse;
import com.shopsphere.dto.response.CartSummaryResponse;
import com.shopsphere.security.UserPrincipal;
import com.shopsphere.service.CartService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart")
@Tag(name = "Shopping Cart", description = "Endpoints for managing the authenticated student's cart")
public class CartController {

    private final CartService cartService;

    public CartController(CartService cartService) {
        this.cartService = cartService;
    }

    @GetMapping
    @Operation(summary = "Get current student's cart summary and items")
    public ResponseEntity<ApiResponse<CartSummaryResponse>> getCart(@AuthenticationPrincipal UserPrincipal principal) {
        CartSummaryResponse summary = cartService.getCartSummary(principal.getId());
        return ResponseEntity.ok(ApiResponse.success(summary));
    }

    @PostMapping("/items")
    @Operation(summary = "Add a product to cart")
    public ResponseEntity<ApiResponse<CartItemResponse>> addToCart(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody CartItemRequest request) {
        CartItemResponse item = cartService.addToCart(principal.getId(), request);
        return new ResponseEntity<>(ApiResponse.success("Product added to cart", item), HttpStatus.CREATED);
    }

    @PutMapping("/items/{itemId}")
    @Operation(summary = "Update quantity of a cart item")
    public ResponseEntity<ApiResponse<CartItemResponse>> updateQuantity(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long itemId,
            @RequestParam int quantity) {
        CartItemResponse item = cartService.updateQuantity(principal.getId(), itemId, quantity);
        return ResponseEntity.ok(ApiResponse.success("Quantity updated", item));
    }

    @DeleteMapping("/items/{itemId}")
    @Operation(summary = "Remove an item from cart")
    public ResponseEntity<ApiResponse<Void>> removeFromCart(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long itemId) {
        cartService.removeFromCart(principal.getId(), itemId);
        return ResponseEntity.ok(ApiResponse.success("Item removed from cart", null));
    }

    @DeleteMapping("/items")
    @Operation(summary = "Clear all items from cart")
    public ResponseEntity<ApiResponse<Void>> clearCart(@AuthenticationPrincipal UserPrincipal principal) {
        cartService.clearCart(principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Cart cleared", null));
    }
}
