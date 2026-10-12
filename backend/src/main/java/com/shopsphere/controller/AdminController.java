package com.shopsphere.controller;

import com.shopsphere.dto.request.CategoryRequest;
import com.shopsphere.dto.request.ProductRequest;
import com.shopsphere.dto.response.*;
import com.shopsphere.enums.OrderStatus;
import com.shopsphere.enums.UserRole;
import com.shopsphere.repository.UserRepository;
import com.shopsphere.service.AdminDashboardService;
import com.shopsphere.service.CategoryService;
import com.shopsphere.service.OrderService;
import com.shopsphere.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Administrator", description = "Endpoints restricted to administrative personnel")
public class AdminController {

    private final AdminDashboardService dashboardService;
    private final ProductService productService;
    private final CategoryService categoryService;
    private final OrderService orderService;
    private final UserRepository userRepository;

    public AdminController(AdminDashboardService dashboardService,
                           ProductService productService,
                           CategoryService categoryService,
                           OrderService orderService,
                           UserRepository userRepository) {
        this.dashboardService = dashboardService;
        this.productService = productService;
        this.categoryService = categoryService;
        this.orderService = orderService;
        this.userRepository = userRepository;
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get administrator dashboard metrics and statistics")
    public ResponseEntity<ApiResponse<DashboardStatsResponse>> getDashboardStats() {
        DashboardStatsResponse stats = dashboardService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    // --- Product Management ---

    @GetMapping("/products")
    @Operation(summary = "Get all products with pagination for administration")
    public ResponseEntity<ApiResponse<Page<ProductResponse>>> getAdminProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<ProductResponse> products = productService.getAllProductsAdmin(pageable);
        return ResponseEntity.ok(ApiResponse.success(products));
    }

    @PostMapping("/products")
    @Operation(summary = "Create a new catalog product")
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(@Valid @RequestBody ProductRequest request) {
        ProductResponse response = productService.createProduct(request);
        return new ResponseEntity<>(ApiResponse.success("Product created successfully", response), HttpStatus.CREATED);
    }

    @PutMapping("/products/{id}")
    @Operation(summary = "Update an existing catalog product")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductRequest request) {
        ProductResponse response = productService.updateProduct(id, request);
        return ResponseEntity.ok(ApiResponse.success("Product updated successfully", response));
    }

    @PatchMapping("/products/{id}/stock")
    @Operation(summary = "Update product inventory stock level")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProductStock(
            @PathVariable Long id,
            @RequestParam int stock) {
        ProductResponse response = productService.updateStock(id, stock);
        return ResponseEntity.ok(ApiResponse.success("Stock updated successfully", response));
    }

    @DeleteMapping("/products/{id}")
    @Operation(summary = "Deactivate a product (soft delete)")
    public ResponseEntity<ApiResponse<Void>> deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Product deactivated successfully", null));
    }

    // --- Category Management ---

    @GetMapping("/categories")
    @Operation(summary = "Get all categories for administration")
    public ResponseEntity<ApiResponse<List<CategoryResponse>>> getAdminCategories() {
        List<CategoryResponse> categories = categoryService.getAllCategoriesAdmin();
        return ResponseEntity.ok(ApiResponse.success(categories));
    }

    @PostMapping("/categories")
    @Operation(summary = "Create a new catalog category")
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(@Valid @RequestBody CategoryRequest request) {
        CategoryResponse response = categoryService.createCategory(request);
        return new ResponseEntity<>(ApiResponse.success("Category created successfully", response), HttpStatus.CREATED);
    }

    @PutMapping("/categories/{id}")
    @Operation(summary = "Update an existing catalog category")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request) {
        CategoryResponse response = categoryService.updateCategory(id, request);
        return ResponseEntity.ok(ApiResponse.success("Category updated successfully", response));
    }

    @DeleteMapping("/categories/{id}")
    @Operation(summary = "Deactivate a category (soft delete)")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(@PathVariable Long id) {
        categoryService.deleteCategory(id);
        return ResponseEntity.ok(ApiResponse.success("Category deactivated successfully", null));
    }

    // --- Order Management ---

    @GetMapping("/orders")
    @Operation(summary = "Get all customer orders for administration")
    public ResponseEntity<ApiResponse<Page<OrderResponse>>> getAdminOrders(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<OrderResponse> orders = orderService.getAllOrdersAdmin(pageable);
        return ResponseEntity.ok(ApiResponse.success(orders));
    }

    @PatchMapping("/orders/{id}/status")
    @Operation(summary = "Update an order's fulfillment status")
    public ResponseEntity<ApiResponse<OrderResponse>> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam OrderStatus status) {
        OrderResponse response = orderService.updateOrderStatusAdmin(id, status);
        return ResponseEntity.ok(ApiResponse.success("Order status updated to " + status, response));
    }

    // --- Customers Management ---

    @GetMapping("/customers")
    @Operation(summary = "Get registered student customer accounts")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getCustomers() {
        List<UserResponse> customers = userRepository.findByRole(UserRole.CUSTOMER).stream()
                .map(UserResponse::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(customers));
    }
}
