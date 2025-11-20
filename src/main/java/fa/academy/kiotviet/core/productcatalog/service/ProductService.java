package fa.academy.kiotviet.core.productcatalog.service;

import fa.academy.kiotviet.application.dto.productcatalog.request.ProductCreateRequest;
import fa.academy.kiotviet.application.dto.productcatalog.request.ProductUpdateRequest;
import fa.academy.kiotviet.application.dto.productcatalog.response.ProductAutocompleteItem;
import fa.academy.kiotviet.application.dto.productcatalog.response.ProductDto;
import fa.academy.kiotviet.core.productcatalog.domain.Product;
import fa.academy.kiotviet.core.productcatalog.repository.ProductRepository;
import fa.academy.kiotviet.core.shared.exception.ResourceNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for Product entities with comprehensive CRUD operations.
 * Supports multi-tenant architecture with company-level isolation.
 */
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    @Transactional
    public ProductDto create(Long companyId, ProductCreateRequest req) {
        // Validate unique constraints
        if (productRepository.existsByCompany_IdAndSkuIgnoreCase(companyId, req.getSku())) {
            throw new IllegalArgumentException("Product SKU already exists in this company");
        }

        if (req.getBarcode() != null && !req.getBarcode().trim().isEmpty() &&
            productRepository.existsByCompany_IdAndBarcodeIgnoreCase(companyId, req.getBarcode())) {
            throw new IllegalArgumentException("Product barcode already exists in this company");
        }

        // Validate business logic
        if (req.getSellingPrice().compareTo(req.getCostPrice()) <= 0) {
            throw new IllegalArgumentException("Selling price must be greater than cost price");
        }

        if (req.getMaxLevel() != null && req.getMinLevel() != null &&
            req.getMaxLevel() > 0 && req.getMinLevel() >= req.getMaxLevel()) {
            throw new IllegalArgumentException("Maximum level must be greater than minimum level");
        }

        Product product = Product.builder()
                .company(fa.academy.kiotviet.core.tenant.domain.Company.builder().id(companyId).build())
                .sku(req.getSku())
                .name(req.getName())
                .barcode(req.getBarcode())
                .description(req.getDescription())
                .sellingPrice(req.getSellingPrice())
                .costPrice(req.getCostPrice())
                .onHand(req.getOnHand() != null ? req.getOnHand() : 0)
                .minLevel(req.getMinLevel() != null ? req.getMinLevel() : 0)
                .maxLevel(req.getMaxLevel() != null ? req.getMaxLevel() : 0)
                .status(req.getStatus() != null ? req.getStatus() : Product.ProductStatus.ACTIVE)
                .isTracked(req.getIsTracked() != null ? req.getIsTracked() : true)
                .build();

        // Set relationships if provided
        if (req.getCategoryId() != null) {
            product.setCategory(fa.academy.kiotviet.core.productcatalog.domain.Category.builder()
                    .id(req.getCategoryId()).build());
        }

        if (req.getSupplierId() != null) {
            product.setSupplier(fa.academy.kiotviet.core.suppliers.domain.Supplier.builder()
                    .id(req.getSupplierId()).build());
        }

        if (req.getBrandId() != null) {
            product.setBrand(fa.academy.kiotviet.core.productcatalog.domain.Brand.builder()
                    .id(req.getBrandId()).build());
        }

        Product saved = productRepository.save(product);
        return toDto(saved);
    }

    @Transactional
    public ProductDto update(Long companyId, Long id, ProductUpdateRequest req) {
        Product product = productRepository.findByIdAndCompany_Id(id, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found", "PRODUCT_NOT_FOUND"));

        // Validate SKU uniqueness if changed
        if (req.getSku() != null && !req.getSku().equalsIgnoreCase(product.getSku())) {
            if (productRepository.existsByCompany_IdAndSkuIgnoreCase(companyId, req.getSku())) {
                throw new IllegalArgumentException("Product SKU already exists in this company");
            }
            product.setSku(req.getSku());
        }

        // Validate barcode uniqueness if changed
        if (req.getBarcode() != null && !req.getBarcode().equalsIgnoreCase(product.getBarcode())) {
            if (!req.getBarcode().trim().isEmpty() &&
                productRepository.existsByCompany_IdAndBarcodeIgnoreCase(companyId, req.getBarcode())) {
                throw new IllegalArgumentException("Product barcode already exists in this company");
            }
            product.setBarcode(req.getBarcode());
        }

        // Update basic fields
        if (req.getName() != null) product.setName(req.getName());
        if (req.getDescription() != null) product.setDescription(req.getDescription());
        if (req.getSellingPrice() != null) product.setSellingPrice(req.getSellingPrice());
        if (req.getCostPrice() != null) product.setCostPrice(req.getCostPrice());
        if (req.getStatus() != null) product.setStatus(req.getStatus());
        if (req.getIsTracked() != null) product.setIsTracked(req.getIsTracked());

        // Update inventory fields
        if (req.getOnHand() != null) {
            if (req.getOnHand() < 0) {
                throw new IllegalArgumentException("On hand quantity cannot be negative");
            }
            product.setOnHand(req.getOnHand());
        }

        if (req.getMinLevel() != null) {
            if (req.getMinLevel() < 0) {
                throw new IllegalArgumentException("Minimum level cannot be negative");
            }
            product.setMinLevel(req.getMinLevel());
        }

        if (req.getMaxLevel() != null) {
            if (req.getMaxLevel() < 0) {
                throw new IllegalArgumentException("Maximum level cannot be negative");
            }
            product.setMaxLevel(req.getMaxLevel());
        }

        // Validate business logic for inventory levels
        if (product.getMinLevel() != null && product.getMaxLevel() != null &&
            product.getMaxLevel() > 0 && product.getMinLevel() >= product.getMaxLevel()) {
            throw new IllegalArgumentException("Maximum level must be greater than minimum level");
        }

        // Validate pricing logic
        if (product.getSellingPrice() != null && product.getCostPrice() != null &&
            product.getSellingPrice().compareTo(product.getCostPrice()) <= 0) {
            throw new IllegalArgumentException("Selling price must be greater than cost price");
        }

        // Update relationships
        if (req.getCategoryId() != null) {
            product.setCategory(fa.academy.kiotviet.core.productcatalog.domain.Category.builder()
                    .id(req.getCategoryId()).build());
        }

        if (req.getSupplierId() != null) {
            product.setSupplier(fa.academy.kiotviet.core.suppliers.domain.Supplier.builder()
                    .id(req.getSupplierId()).build());
        }

        if (req.getBrandId() != null) {
            product.setBrand(fa.academy.kiotviet.core.productcatalog.domain.Brand.builder()
                    .id(req.getBrandId()).build());
        }

        Product saved = productRepository.save(product);
        return toDto(saved);
    }

    @Transactional
    public void softDelete(Long companyId, Long id) {
        Product product = productRepository.findByIdAndCompany_Id(id, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found", "PRODUCT_NOT_FOUND"));
        product.setStatus(Product.ProductStatus.DISCONTINUED);
        productRepository.save(product);
    }

    public ProductDto get(Long companyId, Long id) {
        Product product = productRepository.findByIdAndCompany_Id(id, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found", "PRODUCT_NOT_FOUND"));
        return toDto(product);
    }

    public Page<ProductDto> list(
            Long companyId,
            String search,
            Long categoryId,
            List<Long> categoryIds,
            Long supplierId,
            List<Long> supplierIds,
            Long brandId,
            List<Long> brandIds,
            Product.ProductStatus status,
            Boolean tracked,
            Integer page,
            Integer size,
            String sortBy,
            String sortDir
    ) {
        Sort sort = Sort.by("desc".equalsIgnoreCase(sortDir) ? Sort.Direction.DESC : Sort.Direction.ASC,
                (sortBy == null || sortBy.isBlank()) ? "name" : sortBy);
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(size, 1), sort);

        Specification<Product> spec = Specification.where(byCompany(companyId))
                .and(likeSearch(search))
                .and(eqCategoryOrCategories(categoryId, categoryIds))
                .and(eqSupplierOrSuppliers(supplierId, supplierIds))
                .and(eqBrandOrBrands(brandId, brandIds))
                .and(eqStatus(status))
                .and(eqTracked(tracked));

        Page<Product> result = productRepository.findAll(spec, pageable);
        return result.map(this::toDto);
    }

    public List<ProductAutocompleteItem> autocomplete(Long companyId, String query, int limit) {
        return autocomplete(companyId, query, limit, null);
    }

    public List<ProductAutocompleteItem> autocomplete(Long companyId, String query, int limit, Long supplierId) {
        int effectiveLimit = limit <= 0 ? 10 : Math.min(limit, 50);
        Pageable pageable = PageRequest.of(0, effectiveLimit, Sort.by("name").ascending());
        String q = query == null ? "" : query.trim();
        List<Product> products;
        if (supplierId != null) {
            products = productRepository.autocompleteProductNamesBySupplier(companyId, supplierId, q, pageable);
        } else {
            products = productRepository.autocompleteProductNames(companyId, q, pageable);
        }

        return products.stream()
                .map(p -> ProductAutocompleteItem.builder()
                        .id(p.getId())
                        .sku(p.getSku())
                        .name(p.getName())
                        .barcode(p.getBarcode())
                        .displayName(buildDisplayName(p))
                        .onHand(p.getOnHand())
                        .isAvailable(p.isAvailable())
                        .sellingPrice(p.getSellingPrice().toString())
                        .build())
                .collect(Collectors.toList());
    }

    public List<ProductDto> findLowStockProducts(Long companyId) {
        List<Product> products = productRepository.findLowStockProducts(companyId);
        return products.stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<ProductDto> findOutOfStockProducts(Long companyId) {
        List<Product> products = productRepository.findOutOfStockProducts(companyId);
        return products.stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<ProductDto> findOverstockedProducts(Long companyId) {
        List<Product> products = productRepository.findOverstockedProducts(companyId);
        return products.stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<ProductDto> findByPriceRange(Long companyId, java.math.BigDecimal minPrice, java.math.BigDecimal maxPrice) {
        List<Product> products = productRepository.findByPriceRange(companyId, minPrice, maxPrice);
        return products.stream().map(this::toDto).collect(Collectors.toList());
    }

    // Private helper methods
    private ProductDto toDto(Product product) {
        return ProductDto.builder()
                .id(product.getId())
                .sku(product.getSku())
                .name(product.getName())
                .barcode(product.getBarcode())
                .description(product.getDescription())
                .sellingPrice(product.getSellingPrice())
                .costPrice(product.getCostPrice())
                .profitAmount(product.getProfitAmount())
                .profitMargin(product.getProfitMargin())
                .onHand(product.getOnHand())
                .minLevel(product.getMinLevel())
                .maxLevel(product.getMaxLevel())
                .status(product.getStatus())
                .isTracked(product.getIsTracked())
                .stockStatus(product.getStockStatus())
                .needsReorder(product.needsReorder())
                .reorderQuantity(product.getReorderQuantity())
                .isAvailable(product.isAvailable())
                .category(toCategoryDto(product.getCategory()))
                .supplier(toSupplierDto(product.getSupplier()))
                .brand(toBrandDto(product.getBrand()))
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                .build();
    }

    private ProductDto.CategoryDto toCategoryDto(fa.academy.kiotviet.core.productcatalog.domain.Category category) {
        if (category == null) return null;

        return ProductDto.CategoryDto.builder()
                .id(category.getId())
                .name(category.getName())
                .path(category.getPath())
                .fullPathName(category.getFullPathName())
                .build();
    }

    private ProductDto.SupplierDto toSupplierDto(fa.academy.kiotviet.core.suppliers.domain.Supplier supplier) {
        if (supplier == null) return null;

        return ProductDto.SupplierDto.builder()
                .id(supplier.getId())
                .name(supplier.getName())
                .contactPerson(supplier.getContactPerson())
                .phone(supplier.getPhone())
                .email(supplier.getEmail())
                .isActive(supplier.getIsActive())
                .build();
    }

    private ProductDto.BrandDto toBrandDto(fa.academy.kiotviet.core.productcatalog.domain.Brand brand) {
        if (brand == null) return null;

        return ProductDto.BrandDto.builder()
                .id(brand.getId())
                .name(brand.getName())
                .description(brand.getDescription())
                .website(brand.getWebsite())
                .logoUrl(brand.getLogoUrl())
                .isActive(brand.getIsActive())
                .build();
    }

    private String buildDisplayName(Product product) {
        if (product.getSku() != null && !product.getSku().trim().isEmpty()) {
            return String.format("%s - %s", product.getSku(), product.getName());
        }
        return product.getName();
    }

    // Specification methods
    private Specification<Product> byCompany(Long companyId) {
        return (root, query, cb) -> cb.equal(root.get("company").get("id"), companyId);
    }

    private Specification<Product> likeSearch(String search) {
        if (search == null || search.isBlank()) return null;
        String pattern = "%" + search.toLowerCase() + "%";
        return (root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("name")), pattern),
                cb.like(cb.lower(root.get("sku")), pattern),
                cb.like(cb.lower(root.get("barcode")), pattern)
        );
    }

    private Specification<Product> eqCategory(Long categoryId) {
        if (categoryId == null) return null;
        return (root, query, cb) -> cb.equal(root.get("category").get("id"), categoryId);
    }

    private Specification<Product> eqSupplier(Long supplierId) {
        if (supplierId == null) return null;
        return (root, query, cb) -> cb.equal(root.get("supplier").get("id"), supplierId);
    }

    private Specification<Product> eqBrand(Long brandId) {
        if (brandId == null) return null;
        return (root, query, cb) -> cb.equal(root.get("brand").get("id"), brandId);
    }

    private Specification<Product> eqStatus(Product.ProductStatus status) {
        if (status == null) return null;
        return (root, query, cb) -> cb.equal(root.get("status"), status);
    }

    private Specification<Product> eqTracked(Boolean tracked) {
        if (tracked == null) return null;
        return (root, query, cb) -> cb.equal(root.get("isTracked"), tracked);
    }

    private Specification<Product> eqCategoryOrCategories(Long categoryId, List<Long> categoryIds) {
        if (categoryId != null) {
            return eqCategory(categoryId);
        }
        if (categoryIds == null || categoryIds.isEmpty()) {
            return null;
        }
        return (root, query, cb) -> root.get("category").get("id").in(categoryIds);
    }

    private Specification<Product> eqSupplierOrSuppliers(Long supplierId, List<Long> supplierIds) {
        if (supplierId != null) {
            return eqSupplier(supplierId);
        }
        if (supplierIds == null || supplierIds.isEmpty()) {
            return null;
        }
        return (root, query, cb) -> root.get("supplier").get("id").in(supplierIds);
    }

    private Specification<Product> eqBrandOrBrands(Long brandId, List<Long> brandIds) {
        if (brandId != null) {
            return eqBrand(brandId);
        }
        if (brandIds == null || brandIds.isEmpty()) {
            return null;
        }
        return (root, query, cb) -> root.get("brand").get("id").in(brandIds);
    }
}
