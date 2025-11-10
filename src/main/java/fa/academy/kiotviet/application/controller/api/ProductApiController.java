package fa.academy.kiotviet.application.controller.api;

import fa.academy.kiotviet.application.dto.shared.PagedResponse;
import fa.academy.kiotviet.application.dto.shared.SuccessResponse;
import fa.academy.kiotviet.application.dto.productcatalog.*;
import fa.academy.kiotviet.application.dto.productcatalog.request.*;
import fa.academy.kiotviet.application.dto.productcatalog.response.*;
import fa.academy.kiotviet.application.service.ResponseFactory;
import fa.academy.kiotviet.core.productcatalog.domain.Product;
import fa.academy.kiotviet.core.productcatalog.service.ProductService;
import fa.academy.kiotviet.core.productcatalog.domain.Category;
import fa.academy.kiotviet.core.productcatalog.repository.CategoryRepository;
import fa.academy.kiotviet.core.suppliers.domain.Supplier;
import fa.academy.kiotviet.core.suppliers.repository.SupplierRepository;
import fa.academy.kiotviet.infrastructure.security.JwtAuthenticationFilter;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class ProductApiController {

    private final ProductService productService;
    private final ProductMapper productMapper;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;

    // List products with filters and pagination
    @GetMapping
    public SuccessResponse<PagedResponse<ProductListItemDto>> list(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) List<Long> categoryIds,
            @RequestParam(required = false) Long supplierId,
            @RequestParam(required = false) Product.ProductStatus status,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Integer minStock,
            @RequestParam(required = false) Integer maxStock,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortDir
    ) {
        Long companyId = currentCompanyId();

        // If multiple categoryIds are provided, we'll use the first one for basic search
        // (can be enhanced later to support multiple category filtering)
        Long categoryId = categoryIds != null && !categoryIds.isEmpty() ? categoryIds.get(0) : null;

        Page<Product> productPage = productService.list(
                companyId, query, categoryId, supplierId, status,
                minPrice, maxPrice, minStock, maxStock, page, size, sortBy, sortDir);

        List<ProductListItemDto> products = productMapper.toListItemDtoList(productPage.getContent());
        PagedResponse<ProductListItemDto> response = PagedResponse.<ProductListItemDto>of(
                products,
                productPage.getNumber(),
                productPage.getSize(),
                productPage.getTotalElements()
        );

        return ResponseFactory.success(response, "Products retrieved successfully");
    }

    // Advanced search endpoint (alias for list with all parameters)
    @GetMapping("/search")
    public SuccessResponse<PagedResponse<ProductListItemDto>> search(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) List<Long> categoryIds,
            @RequestParam(required = false) Long supplierId,
            @RequestParam(required = false) Product.ProductStatus status,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(required = false) Integer minStock,
            @RequestParam(required = false) Integer maxStock,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String sortBy,
            @RequestParam(required = false) String sortDir
    ) {
        return list(query, categoryIds, supplierId, status, minPrice, maxPrice,
                   minStock, maxStock, page, size, sortBy, sortDir);
    }

    // Get product details
    @GetMapping("/{id}")
    public SuccessResponse<ProductDto> get(@PathVariable Long id) {
        Long companyId = currentCompanyId();
        Product product = productService.findById(companyId, id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        ProductDto productDto = productMapper.toDto(product);
        return ResponseFactory.success(productDto, "Product retrieved successfully");
    }

    // Create new product
    @PostMapping
    public SuccessResponse<ProductDto> create(@Valid @RequestBody ProductCreateRequest request) {
        Long companyId = currentCompanyId();

        // Validate category and supplier exist and belong to company
        validateCategoryAndSupplier(request, companyId);

        Product product = productMapper.toEntity(request);

        // Set relationships
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findByIdAndCompany_Id(request.getCategoryId(), companyId)
                    .orElseThrow(() -> new IllegalArgumentException("Category not found"));
            product.setCategory(category);
        }

        if (request.getSupplierId() != null) {
            Supplier supplier = supplierRepository.findByIdAndCompany_Id(request.getSupplierId(), companyId)
                    .orElseThrow(() -> new IllegalArgumentException("Supplier not found"));
            product.setSupplier(supplier);
        }

        Product saved = productService.create(companyId, product);
        ProductDto productDto = productMapper.toDto(saved);

        return ResponseFactory.created(productDto, "Product created successfully");
    }

    // Update existing product
    @PutMapping("/{id}")
    public SuccessResponse<ProductDto> update(@PathVariable Long id, @Valid @RequestBody ProductUpdateRequest request) {
        Long companyId = currentCompanyId();

        // Validate category and supplier exist and belong to company
        validateCategoryAndSupplier(request, companyId);

        Product existing = productService.findById(companyId, id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));

        // Update relationships
        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findByIdAndCompany_Id(request.getCategoryId(), companyId)
                    .orElseThrow(() -> new IllegalArgumentException("Category not found"));
            existing.setCategory(category);
        } else {
            existing.setCategory(null);
        }

        if (request.getSupplierId() != null) {
            Supplier supplier = supplierRepository.findByIdAndCompany_Id(request.getSupplierId(), companyId)
                    .orElseThrow(() -> new IllegalArgumentException("Supplier not found"));
            existing.setSupplier(supplier);
        } else {
            existing.setSupplier(null);
        }

        // Update other fields
        Product updated = productService.update(companyId, id, existing);
        ProductDto productDto = productMapper.toDto(updated);

        return ResponseFactory.success(productDto, "Product updated successfully");
    }

    // Toggle product status
    @PutMapping("/{id}/status")
    public SuccessResponse<ProductDto> updateStatus(@PathVariable Long id, @Valid @RequestBody ProductStatusUpdateRequest request) {
        Long companyId = currentCompanyId();
        productService.toggleStatus(companyId, id, request.getStatus());

        Product product = productService.findById(companyId, id)
                .orElseThrow(() -> new IllegalArgumentException("Product not found"));
        ProductDto productDto = productMapper.toDto(product);

        return ResponseFactory.success(productDto, "Product status updated successfully");
    }

    // Soft delete product
    @DeleteMapping("/{id}")
    public SuccessResponse<String> delete(@PathVariable Long id) {
        Long companyId = currentCompanyId();
        productService.softDelete(companyId, id);
        return ResponseFactory.success("Product deleted successfully");
    }

    // Bulk operations
    @PostMapping("/bulk/status")
    public SuccessResponse<String> bulkUpdateStatus(@Valid @RequestBody ProductBulkStatusRequest request) {
        Long companyId = currentCompanyId();
        productService.bulkToggleStatus(companyId, request.getProductIds(), request.getStatus());
        return ResponseFactory.success("Bulk status update completed successfully");
    }

    @PostMapping("/bulk/delete")
    public SuccessResponse<String> bulkDelete(@Valid @RequestBody ProductBulkDeleteRequest request) {
        Long companyId = currentCompanyId();
        productService.bulkSoftDelete(companyId, request.getProductIds());
        return ResponseFactory.success("Bulk delete completed successfully");
    }

    // Autocomplete for dropdowns
    @GetMapping("/autocomplete")
    public SuccessResponse<List<ProductAutocompleteItem>> autocomplete(
            @RequestParam(name = "query") String query,
            @RequestParam(name = "limit", defaultValue = "10") int limit
    ) {
        Long companyId = currentCompanyId();
        List<Product> products = productService.autocomplete(companyId, query, limit);
        List<ProductAutocompleteItem> items = productMapper.toAutocompleteItemList(products);
        return ResponseFactory.success(items, "Products autocomplete retrieved successfully");
    }

    // Statistics endpoints
    @GetMapping("/stats/summary")
    public SuccessResponse<ProductStatsDto> getStats() {
        Long companyId = currentCompanyId();

        long totalActive = productService.countActiveProducts(companyId);
        long totalInactive = productService.countInactiveProducts(companyId);
        long totalActiveStatus = productService.countProductsByStatus(companyId, Product.ProductStatus.ACTIVE);
        long totalInactiveStatus = productService.countProductsByStatus(companyId, Product.ProductStatus.INACTIVE);
        long lowStock = productService.getLowStockProducts(companyId).size();
        long outOfStock = productService.getOutOfStockProducts(companyId).size();

        ProductStatsDto stats = ProductStatsDto.builder()
                .totalActive(totalActive)
                .totalInactive(totalInactive)
                .totalActiveStatus(totalActiveStatus)
                .totalInactiveStatus(totalInactiveStatus)
                .lowStockCount(lowStock)
                .outOfStockCount(outOfStock)
                .build();

        return ResponseFactory.success(stats, "Product statistics retrieved successfully");
    }

    // Helper methods

    private Long currentCompanyId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof JwtAuthenticationFilter.UserPrincipal)) {
            throw new IllegalStateException("No authenticated user found");
        }
        JwtAuthenticationFilter.UserPrincipal principal = (JwtAuthenticationFilter.UserPrincipal) auth.getPrincipal();
        return principal.getCompanyId();
    }

    private void validateCategoryAndSupplier(Object request, Long companyId) {
        if (request instanceof ProductCreateRequest) {
            ProductCreateRequest req = (ProductCreateRequest) request;
            if (req.getCategoryId() != null &&
                !categoryRepository.findByIdAndCompany_Id(req.getCategoryId(), companyId).isPresent()) {
                throw new IllegalArgumentException("Category not found or does not belong to this company");
            }
            if (req.getSupplierId() != null &&
                !supplierRepository.findByIdAndCompany_Id(req.getSupplierId(), companyId).isPresent()) {
                throw new IllegalArgumentException("Supplier not found or does not belong to this company");
            }
        } else if (request instanceof ProductUpdateRequest) {
            ProductUpdateRequest req = (ProductUpdateRequest) request;
            if (req.getCategoryId() != null &&
                !categoryRepository.findByIdAndCompany_Id(req.getCategoryId(), companyId).isPresent()) {
                throw new IllegalArgumentException("Category not found or does not belong to this company");
            }
            if (req.getSupplierId() != null &&
                !supplierRepository.findByIdAndCompany_Id(req.getSupplierId(), companyId).isPresent()) {
                throw new IllegalArgumentException("Supplier not found or does not belong to this company");
            }
        }
    }
}