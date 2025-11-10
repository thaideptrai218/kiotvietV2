package fa.academy.kiotviet.core.productcatalog.service;

import fa.academy.kiotviet.core.productcatalog.domain.Product;
import fa.academy.kiotviet.core.productcatalog.repository.ProductRepository;
import fa.academy.kiotviet.core.tenant.domain.Company;
import fa.academy.kiotviet.core.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductService {

    private final ProductRepository productRepository;

    // Basic CRUD operations

    @Transactional
    public Product create(Long companyId, Product product) {
        log.debug("Creating product for company {}: {}", companyId, product.getName());

        // Validate uniqueness constraints
        validateProductUniqueness(companyId, product);

        // Set company reference
        product.setCompany(Company.builder().id(companyId).build());

        Product saved = productRepository.save(product);
        log.debug("Product created successfully with ID: {}", saved.getId());
        return saved;
    }

    @Transactional
    public Product update(Long companyId, Long id, Product product) {
        log.debug("Updating product {} for company {}", id, companyId);

        Product existing = productRepository.findByIdAndCompany_Id(id, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found", "PRODUCT_NOT_FOUND"));

        // Validate uniqueness if barcode/sku is being changed
        if (product.getBarcode() != null && !product.getBarcode().equalsIgnoreCase(existing.getBarcode())) {
            if (productRepository.existsByCompany_IdAndBarcodeIgnoreCase(companyId, product.getBarcode())) {
                throw new IllegalArgumentException("Product with this barcode already exists in this company");
            }
            existing.setBarcode(product.getBarcode());
        }

        if (product.getSku() != null && !product.getSku().equalsIgnoreCase(existing.getSku())) {
            if (productRepository.existsByCompany_IdAndSkuIgnoreCase(companyId, product.getSku())) {
                throw new IllegalArgumentException("Product with this SKU already exists in this company");
            }
            existing.setSku(product.getSku());
        }

        // Update fields
        updateProductFields(existing, product);

        Product saved = productRepository.save(existing);
        log.debug("Product updated successfully: {}", saved.getId());
        return saved;
    }

    @Transactional
    public void softDelete(Long companyId, Long id) {
        log.debug("Soft deleting product {} for company {}", id, companyId);

        Product product = productRepository.findByIdAndCompany_Id(id, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found", "PRODUCT_NOT_FOUND"));

        product.setIsActive(false);
        productRepository.save(product);
        log.debug("Product soft deleted successfully: {}", id);
    }

    @Transactional
    public void toggleStatus(Long companyId, Long id, Product.ProductStatus status) {
        log.debug("Toggling product {} status to {} for company {}", id, status, companyId);

        Product product = productRepository.findByIdAndCompany_Id(id, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found", "PRODUCT_NOT_FOUND"));

        product.setStatus(status);
        productRepository.save(product);
        log.debug("Product status updated successfully: {} -> {}", id, status);
    }

    // Search and list operations

    public Page<Product> list(Long companyId, String query, Long categoryId, Long supplierId,
                              Product.ProductStatus status, BigDecimal minPrice, BigDecimal maxPrice,
                              Integer minStock, Integer maxStock, int page, int size,
                              String sortBy, String sortDir) {

        log.debug("Listing products for company {} with filters", companyId);

        Sort sort = buildSort(sortBy, sortDir);
        Pageable pageable = PageRequest.of(page, size, sort);

        return productRepository.advancedSearch(
                companyId, query, categoryId, supplierId, status,
                minPrice, maxPrice, minStock, maxStock, pageable);
    }

    public Optional<Product> findById(Long companyId, Long id) {
        return productRepository.findByIdAndCompany_Id(id, companyId);
    }

    public Optional<Product> findByBarcode(Long companyId, String barcode) {
        return productRepository.findByCompany_IdAndBarcodeIgnoreCase(companyId, barcode);
    }

    public Optional<Product> findBySku(Long companyId, String sku) {
        return productRepository.findByCompany_IdAndSkuIgnoreCase(companyId, sku);
    }

    public List<Product> autocomplete(Long companyId, String query, int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return productRepository.autocomplete(companyId, query, pageable);
    }

    // Statistics and reporting

    public long countActiveProducts(Long companyId) {
        return productRepository.countByCompany_IdAndIsActive(companyId, true);
    }

    public long countInactiveProducts(Long companyId) {
        return productRepository.countByCompany_IdAndIsActive(companyId, false);
    }

    public long countProductsByStatus(Long companyId, Product.ProductStatus status) {
        return productRepository.countByCompany_IdAndStatusAndIsActive(companyId, status, true);
    }

    public long countProductsByCategory(Long companyId, Long categoryId) {
        return productRepository.countByCompany_IdAndCategory_IdAndIsActive(companyId, categoryId, true);
    }

    public long countProductsBySupplier(Long companyId, Long supplierId) {
        return productRepository.countByCompany_IdAndSupplier_IdAndIsActive(companyId, supplierId, true);
    }

    public List<Product> getLowStockProducts(Long companyId) {
        return productRepository.findLowStockProducts(companyId);
    }

    public List<Product> getOutOfStockProducts(Long companyId) {
        return productRepository.findOutOfStockProducts(companyId);
    }

    // Bulk operations

    @Transactional
    public void bulkToggleStatus(Long companyId, List<Long> productIds, Product.ProductStatus status) {
        log.debug("Bulk toggling status for {} products in company {}", productIds.size(), companyId);

        List<Product> products = productRepository.findByCompany_IdAndIsActive(companyId, true)
                .stream()
                .filter(p -> productIds.contains(p.getId()))
                .toList();

        for (Product product : products) {
            product.setStatus(status);
        }

        productRepository.saveAll(products);
        log.debug("Bulk status update completed for {} products", products.size());
    }

    @Transactional
    public void bulkSoftDelete(Long companyId, List<Long> productIds) {
        log.debug("Bulk soft deleting {} products in company {}", productIds.size(), companyId);

        List<Product> products = productRepository.findByCompany_IdAndIsActive(companyId, true)
                .stream()
                .filter(p -> productIds.contains(p.getId()))
                .toList();

        for (Product product : products) {
            product.setIsActive(false);
        }

        productRepository.saveAll(products);
        log.debug("Bulk soft delete completed for {} products", products.size());
    }

    // Helper methods

    private void validateProductUniqueness(Long companyId, Product product) {
        if (product.getBarcode() != null &&
            productRepository.existsByCompany_IdAndBarcodeIgnoreCase(companyId, product.getBarcode())) {
            throw new IllegalArgumentException("Product with this barcode already exists in this company");
        }

        if (product.getSku() != null &&
            productRepository.existsByCompany_IdAndSkuIgnoreCase(companyId, product.getSku())) {
            throw new IllegalArgumentException("Product with this SKU already exists in this company");
        }
    }

    private void updateProductFields(Product existing, Product updates) {
        if (updates.getName() != null) existing.setName(updates.getName());
        if (updates.getDescription() != null) existing.setDescription(updates.getDescription());
        if (updates.getCategory() != null) existing.setCategory(updates.getCategory());
        if (updates.getSupplier() != null) existing.setSupplier(updates.getSupplier());
        if (updates.getPrice() != null) existing.setPrice(updates.getPrice());
        if (updates.getCostPrice() != null) existing.setCostPrice(updates.getCostPrice());
        if (updates.getTaxable() != null) existing.setTaxable(updates.getTaxable());
        if (updates.getStock() != null) existing.setStock(updates.getStock());
        if (updates.getMinStock() != null) existing.setMinStock(updates.getMinStock());
        if (updates.getMaxStock() != null) existing.setMaxStock(updates.getMaxStock());
        if (updates.getUnit() != null) existing.setUnit(updates.getUnit());
        if (updates.getBrand() != null) existing.setBrand(updates.getBrand());
        if (updates.getTags() != null) existing.setTags(updates.getTags());
        if (updates.getStatus() != null) existing.setStatus(updates.getStatus());
    }

    private Sort buildSort(String sortBy, String sortDir) {
        Sort.Direction direction = "desc".equalsIgnoreCase(sortDir) ? Sort.Direction.DESC : Sort.Direction.ASC;

        if (sortBy == null || sortBy.trim().isEmpty()) {
            return Sort.by(Sort.Direction.ASC, "name");
        }

        return switch (sortBy.toLowerCase()) {
            case "name" -> Sort.by(direction, "name");
            case "price" -> Sort.by(direction, "price");
            case "stock" -> Sort.by(direction, "stock");
            case "createdat" -> Sort.by(direction, "createdAt");
            case "updatedat" -> Sort.by(direction, "updatedAt");
            case "sku" -> Sort.by(direction, "sku");
            case "barcode" -> Sort.by(direction, "barcode");
            default -> Sort.by(Sort.Direction.ASC, "name");
        };
    }
}