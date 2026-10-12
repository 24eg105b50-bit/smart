package com.shopsphere.service;

import com.shopsphere.dto.request.ProductRequest;
import com.shopsphere.dto.response.ProductResponse;
import com.shopsphere.entity.Category;
import com.shopsphere.entity.Product;
import com.shopsphere.exception.BadRequestException;
import com.shopsphere.exception.ResourceNotFoundException;
import com.shopsphere.repository.ProductRepository;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryService categoryService;

    public ProductService(ProductRepository productRepository, CategoryService categoryService) {
        this.productRepository = productRepository;
        this.categoryService = categoryService;
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> getCatalogProducts(
            Long categoryId, BigDecimal minPrice, BigDecimal maxPrice, String keyword, Pageable pageable) {

        String sanitizedKeyword = (keyword != null && !keyword.isBlank()) ? keyword.trim() : null;
        Page<Product> productPage = productRepository.filterCatalog(
                categoryId, minPrice, maxPrice, sanitizedKeyword, pageable);

        return productPage.map(ProductResponse::fromEntity);
    }

    @Transactional(readOnly = true)
    public Page<ProductResponse> getAllProductsAdmin(Pageable pageable) {
        return productRepository.findAll(pageable).map(ProductResponse::fromEntity);
    }

    @Cacheable(value = "products", key = "#id")
    @Transactional(readOnly = true)
    public ProductResponse getProductById(Long id) {
        Product product = getProductEntity(id);
        return ProductResponse.fromEntity(product);
    }

    @Transactional(readOnly = true)
    public ProductResponse getProductBySlug(String slug) {
        Product product = productRepository.findBySlug(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "slug", slug));
        return ProductResponse.fromEntity(product);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> getRelatedProducts(Long productId, int limit) {
        Product current = getProductEntity(productId);
        Pageable pageable = PageRequest.of(0, Math.max(1, limit));

        return productRepository.findRelatedProducts(current.getCategory().getId(), current.getId(), pageable).stream()
                .map(ProductResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Product getProductEntity(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
    }

    @CacheEvict(value = {"products", "featuredProducts"}, allEntries = true)
    @Transactional
    public ProductResponse createProduct(ProductRequest request) {
        String slug = generateSlug(request.getName(), request.getSlug());

        if (productRepository.existsBySlug(slug)) {
            slug = slug + "-" + System.currentTimeMillis() % 10000;
        }

        if (productRepository.existsBySku(request.getSku().trim())) {
            throw new BadRequestException("A product with SKU '" + request.getSku() + "' already exists.");
        }

        Category category = categoryService.getCategoryEntity(request.getCategoryId());

        Product product = new Product(
                category,
                request.getName().trim(),
                slug,
                request.getDescription().trim(),
                request.getBrand().trim(),
                request.getSku().trim().toUpperCase(),
                request.getPrice(),
                request.getStockQuantity(),
                request.getImageUrl()
        );
        product.setActive(request.getActive() != null ? request.getActive() : true);

        Product saved = productRepository.save(product);
        return ProductResponse.fromEntity(saved);
    }

    @CacheEvict(value = {"products", "featuredProducts"}, allEntries = true)
    @Transactional
    public ProductResponse updateProduct(Long id, ProductRequest request) {
        Product product = getProductEntity(id);

        Category category = categoryService.getCategoryEntity(request.getCategoryId());
        product.setCategory(category);
        product.setName(request.getName().trim());

        if (request.getSlug() != null && !request.getSlug().isBlank()) {
            String newSlug = generateSlug(request.getName(), request.getSlug());
            if (!newSlug.equals(product.getSlug()) && productRepository.existsBySlug(newSlug)) {
                throw new BadRequestException("Product with slug '" + newSlug + "' already exists.");
            }
            product.setSlug(newSlug);
        }

        String newSku = request.getSku().trim().toUpperCase();
        if (!newSku.equals(product.getSku()) && productRepository.existsBySku(newSku)) {
            throw new BadRequestException("A product with SKU '" + newSku + "' already exists.");
        }

        product.setSku(newSku);
        product.setDescription(request.getDescription().trim());
        product.setBrand(request.getBrand().trim());
        product.setPrice(request.getPrice());
        product.setStockQuantity(request.getStockQuantity());
        product.setImageUrl(request.getImageUrl());
        if (request.getActive() != null) {
            product.setActive(request.getActive());
        }

        Product updated = productRepository.save(product);
        return ProductResponse.fromEntity(updated);
    }

    @CacheEvict(value = {"products", "featuredProducts"}, allEntries = true)
    @Transactional
    public void deleteProduct(Long id) {
        Product product = getProductEntity(id);
        // Soft delete/deactivate so historical orders are preserved
        product.setActive(false);
        productRepository.save(product);
    }

    @CacheEvict(value = {"products", "featuredProducts"}, allEntries = true)
    @Transactional
    public ProductResponse updateStock(Long id, Integer newStockQuantity) {
        if (newStockQuantity < 0) {
            throw new BadRequestException("Stock quantity cannot be negative");
        }
        Product product = getProductEntity(id);
        product.setStockQuantity(newStockQuantity);
        Product updated = productRepository.save(product);
        return ProductResponse.fromEntity(updated);
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> searchForAiGrounding(String query, int limit) {
        Pageable pageable = PageRequest.of(0, Math.min(limit, 20));
        return productRepository.searchForAiGrounding(query, pageable).stream()
                .map(ProductResponse::fromEntity)
                .collect(Collectors.toList());
    }

    private String generateSlug(String name, String customSlug) {
        if (customSlug != null && !customSlug.isBlank()) {
            return customSlug.trim().toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
        }
        return name.trim().toLowerCase().replaceAll("[^a-z0-9]+", "-").replaceAll("^-|-$", "");
    }
}
