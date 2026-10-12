package com.shopsphere.service;

import com.shopsphere.dto.request.ProductRequest;
import com.shopsphere.dto.response.ProductResponse;
import com.shopsphere.entity.Category;
import com.shopsphere.entity.Product;
import com.shopsphere.exception.BadRequestException;
import com.shopsphere.repository.ProductRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CategoryService categoryService;

    @InjectMocks
    private ProductService productService;

    private Category sampleCategory;
    private Product sampleProduct;

    @BeforeEach
    void setUp() {
        sampleCategory = new Category("Textbooks", "textbooks", "Engineering books", "img");
        sampleCategory.setId(1L);

        sampleProduct = new Product(sampleCategory, "CLRS Algorithms", "clrs-algorithms",
                "Algorithms textbook", "MIT", "BOK-01", new BigDecimal("1899.00"), 20, "img");
        sampleProduct.setId(10L);
    }

    @Test
    @DisplayName("Should create product with valid parameters and unique SKU")
    void testCreateProductSuccess() {
        ProductRequest request = new ProductRequest(1L, "CLRS Algorithms", null,
                "Algorithms textbook", "MIT", "BOK-01", new BigDecimal("1899.00"), 20, "img", true);

        when(productRepository.existsBySlug(anyString())).thenReturn(false);
        when(productRepository.existsBySku("BOK-01")).thenReturn(false);
        when(categoryService.getCategoryEntity(1L)).thenReturn(sampleCategory);
        when(productRepository.save(any(Product.class))).thenReturn(sampleProduct);

        ProductResponse response = productService.createProduct(request);

        assertNotNull(response);
        assertEquals("CLRS Algorithms", response.getName());
        assertEquals("BOK-01", response.getSku());
        assertEquals(new BigDecimal("1899.00"), response.getPrice());
    }

    @Test
    @DisplayName("Should reject product creation when SKU already exists")
    void testDuplicateSkuRejection() {
        ProductRequest request = new ProductRequest(1L, "New Book", null, "Desc", "Brand",
                "BOK-01", new BigDecimal("500.00"), 10, "img", true);

        when(productRepository.existsBySlug(anyString())).thenReturn(false);
        when(productRepository.existsBySku("BOK-01")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> productService.createProduct(request));
        verify(productRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should filter catalog products with keyword and price parameters")
    void testCatalogFiltering() {
        Pageable pageable = PageRequest.of(0, 10);
        when(productRepository.filterCatalog(1L, new BigDecimal("1000"), new BigDecimal("2000"), "algorithms", pageable))
                .thenReturn(new PageImpl<>(List.of(sampleProduct)));

        Page<ProductResponse> result = productService.getCatalogProducts(1L, new BigDecimal("1000"), new BigDecimal("2000"), "algorithms", pageable);

        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals("CLRS Algorithms", result.getContent().get(0).getName());
    }

    @Test
    @DisplayName("Should update product stock and reject negative stock quantities")
    void testUpdateStock() {
        when(productRepository.findById(10L)).thenReturn(Optional.of(sampleProduct));
        when(productRepository.save(any(Product.class))).thenAnswer(i -> i.getArgument(0));

        ProductResponse updated = productService.updateStock(10L, 50);
        assertEquals(50, updated.getStockQuantity());

        assertThrows(BadRequestException.class, () -> productService.updateStock(10L, -5));
    }
}
