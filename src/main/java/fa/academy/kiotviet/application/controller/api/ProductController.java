package fa.academy.kiotviet.application.controller.api;

import fa.academy.kiotviet.application.dto.shared.SuccessResponse;
import fa.academy.kiotviet.application.dto.productcatalog.request.ProductCreateRequest;
import fa.academy.kiotviet.application.dto.productcatalog.request.ProductUpdateRequest;
import fa.academy.kiotviet.application.dto.productcatalog.response.ProductAutocompleteItem;
import fa.academy.kiotviet.application.dto.productcatalog.response.ProductDto;
import fa.academy.kiotviet.application.service.ResponseFactory;
import fa.academy.kiotviet.core.productcatalog.domain.Product;
import fa.academy.kiotviet.core.productcatalog.service.ProductService;
import fa.academy.kiotviet.infrastructure.security.JwtAuthenticationFilter;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

/**
 * REST API controller for product management.
 * Provides endpoints for CRUD operations and product inventory management.
 */
@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class ProductController {

    private final ProductService productService;

    /**
     * Get products with pagination, filtering, and sorting
     */
    @GetMapping
    public SuccessResponse<Page<ProductDto>> listProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) List<Long> categoryIds,
            @RequestParam(required = false) Long supplierId,
            @RequestParam(required = false) List<Long> supplierIds,
            @RequestParam(required = false) Long brandId,
            @RequestParam(required = false) List<Long> brandIds,
            @RequestParam(required = false) Product.ProductStatus status,
            @RequestParam(required = false) Boolean tracked,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Long companyId = currentCompanyId();
        Page<ProductDto> products = productService.list(
                companyId, search, categoryId, categoryIds, supplierId, supplierIds, brandId, brandIds, status, tracked,
                page, size, sortBy, sortDir);

        return ResponseFactory.success(products, "Products retrieved successfully");
    }

    /**
     * Get a single product by ID
     */
    @GetMapping("/{id}")
    public SuccessResponse<ProductDto> getProduct(@PathVariable Long id) {
        Long companyId = currentCompanyId();
        ProductDto product = productService.get(companyId, id);
        return ResponseFactory.success(product, "Product retrieved successfully");
    }

    /**
     * Create a new product
     */
    @PostMapping
    public SuccessResponse<ProductDto> createProduct(@Valid @RequestBody ProductCreateRequest request) {
        Long companyId = currentCompanyId();
        ProductDto product = productService.create(companyId, request);
        return ResponseFactory.created(product, "Product created successfully");
    }

    /**
     * Update an existing product
     */
    @PutMapping("/{id}")
    public SuccessResponse<ProductDto> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody ProductUpdateRequest request) {

        Long companyId = currentCompanyId();
        ProductDto product = productService.update(companyId, id, request);
        return ResponseFactory.success(product, "Product updated successfully");
    }

    /**
     * Soft delete a product (mark as discontinued)
     */
    @DeleteMapping("/{id}")
    public SuccessResponse<String> deleteProduct(@PathVariable Long id) {
        Long companyId = currentCompanyId();
        productService.softDelete(companyId, id);
        return ResponseFactory.success("Product deleted successfully");
    }

    /**
     * Search products for autocomplete functionality
     */
    @GetMapping("/autocomplete")
    public SuccessResponse<List<ProductAutocompleteItem>> autocompleteProducts(
            @RequestParam String query,
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam(required = false) Long supplierId) {

        Long companyId = currentCompanyId();
        List<ProductAutocompleteItem> products = productService.autocomplete(companyId, query, limit, supplierId);
        return ResponseFactory.success(products, "Product autocomplete results");
    }

    /**
     * Get products that are low on stock
     */
    @GetMapping("/low-stock")
    public SuccessResponse<List<ProductDto>> getLowStockProducts() {
        Long companyId = currentCompanyId();
        List<ProductDto> products = productService.findLowStockProducts(companyId);
        return ResponseFactory.success(products, "Low stock products retrieved");
    }

    /**
     * Get products that are out of stock
     */
    @GetMapping("/out-of-stock")
    public SuccessResponse<List<ProductDto>> getOutOfStockProducts() {
        Long companyId = currentCompanyId();
        List<ProductDto> products = productService.findOutOfStockProducts(companyId);
        return ResponseFactory.success(products, "Out of stock products retrieved");
    }

    /**
     * Get products that are overstocked
     */
    @GetMapping("/overstocked")
    public SuccessResponse<List<ProductDto>> getOverstockedProducts() {
        Long companyId = currentCompanyId();
        List<ProductDto> products = productService.findOverstockedProducts(companyId);
        return ResponseFactory.success(products, "Overstocked products retrieved");
    }

    /**
     * Get products within a specific price range
     */
    @GetMapping("/price-range")
    public SuccessResponse<List<ProductDto>> getProductsByPriceRange(
            @RequestParam BigDecimal minPrice,
            @RequestParam BigDecimal maxPrice) {

        Long companyId = currentCompanyId();
        List<ProductDto> products = productService.findByPriceRange(companyId, minPrice, maxPrice);
        return ResponseFactory.success(products, "Products in price range retrieved");
    }

    /**
     * Get products by category
     */
    @GetMapping("/category/{categoryId}")
    public SuccessResponse<Page<ProductDto>> getProductsByCategory(
            @PathVariable Long categoryId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Long companyId = currentCompanyId();
        Page<ProductDto> products = productService.list(
                companyId, null, categoryId, null, null, null, null, null, null, null,
                page, size, sortBy, sortDir);

        return ResponseFactory.success(products, "Products in category retrieved");
    }

    /**
     * Get products by supplier
     */
    @GetMapping("/supplier/{supplierId}")
    public SuccessResponse<Page<ProductDto>> getProductsBySupplier(
            @PathVariable Long supplierId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Long companyId = currentCompanyId();
        Page<ProductDto> products = productService.list(
                companyId, null, null, null, supplierId, null, null, null, null, null,
                page, size, sortBy, sortDir);

        return ResponseFactory.success(products, "Products from supplier retrieved");
    }

    /**
     * Get products by brand
     */
    @GetMapping("/brand/{brandId}")
    public SuccessResponse<Page<ProductDto>> getProductsByBrand(
            @PathVariable Long brandId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Long companyId = currentCompanyId();
        Page<ProductDto> products = productService.list(
                companyId, null, null, null, null, null, brandId, null, null, null,
                page, size, sortBy, sortDir);

        return ResponseFactory.success(products, "Products from brand retrieved");
    }

    /**
     * Get active products only
     */
    @GetMapping("/active")
    public SuccessResponse<Page<ProductDto>> getActiveProducts(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Long companyId = currentCompanyId();
        Page<ProductDto> products = productService.list(
                companyId, null, null, null, null, null, null, null, Product.ProductStatus.ACTIVE, null,
                page, size, sortBy, sortDir);

        return ResponseFactory.success(products, "Active products retrieved");
    }

    // Helper method
    private Long currentCompanyId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof JwtAuthenticationFilter.UserPrincipal)) {
            throw new IllegalStateException("No authenticated user found");
        }
        JwtAuthenticationFilter.UserPrincipal principal = (JwtAuthenticationFilter.UserPrincipal) auth.getPrincipal();
        return principal.getCompanyId();
    }
}
