package fa.academy.kiotviet.core.productcatalog.repository;

import fa.academy.kiotviet.core.productcatalog.domain.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    // Basic CRUD with tenant isolation
    Optional<Product> findByIdAndCompany_Id(Long id, Long companyId);

    List<Product> findByCompany_IdAndIsActive(Long companyId, Boolean isActive);

    Page<Product> findByCompany_IdAndIsActive(Long companyId, Boolean isActive, Pageable pageable);

    // Existence checks for validation
    boolean existsByCompany_IdAndBarcodeIgnoreCase(Long companyId, String barcode);

    boolean existsByCompany_IdAndSkuIgnoreCase(Long companyId, String sku);

    boolean existsByCompany_IdAndBarcodeIgnoreCaseAndIdNot(Long companyId, String barcode, Long excludeId);

    boolean existsByCompany_IdAndSkuIgnoreCaseAndIdNot(Long companyId, String sku, Long excludeId);

    // Search by various fields
    @Query("SELECT p FROM Product p WHERE p.company.id = :companyId AND p.isActive = true AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.brand) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.tags) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.barcode) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.sku) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Product> searchByQuery(@Param("companyId") Long companyId, @Param("query") String query, Pageable pageable);

    // Exact match searches
    Optional<Product> findByCompany_IdAndBarcodeIgnoreCase(Long companyId, String barcode);

    Optional<Product> findByCompany_IdAndSkuIgnoreCase(Long companyId, String sku);

    // Category-based searches
    Page<Product> findByCompany_IdAndCategory_IdAndIsActive(Long companyId, Long categoryId, Boolean isActive, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.company.id = :companyId AND p.isActive = true AND p.category.id IN :categoryIds")
    Page<Product> findByCompany_IdAndCategory_IdInAndIsActive(@Param("companyId") Long companyId, @Param("categoryIds") List<Long> categoryIds, Pageable pageable);

    // Supplier-based searches
    Page<Product> findByCompany_IdAndSupplier_IdAndIsActive(Long companyId, Long supplierId, Boolean isActive, Pageable pageable);

    List<Product> findByCompany_IdAndSupplier_IdAndIsActive(Long companyId, Long supplierId, Boolean isActive);

    // Status-based searches
    Page<Product> findByCompany_IdAndStatusAndIsActive(Long companyId, Product.ProductStatus status, Boolean isActive, Pageable pageable);

    // Stock-based searches
    @Query("SELECT p FROM Product p WHERE p.company.id = :companyId AND p.isActive = true AND p.stock <= :maxStock")
    Page<Product> findByCompany_IdAndStockLessThanEqualAndIsActive(@Param("companyId") Long companyId, @Param("maxStock") Integer maxStock, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.company.id = :companyId AND p.isActive = true AND p.stock >= :minStock")
    Page<Product> findByCompany_IdAndStockGreaterThanEqualAndIsActive(@Param("companyId") Long companyId, @Param("minStock") Integer minStock, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.company.id = :companyId AND p.isActive = true AND p.stock BETWEEN :minStock AND :maxStock")
    Page<Product> findByCompany_IdAndStockBetweenAndIsActive(@Param("companyId") Long companyId, @Param("minStock") Integer minStock, @Param("maxStock") Integer maxStock, Pageable pageable);

    // Price-based searches
    @Query("SELECT p FROM Product p WHERE p.company.id = :companyId AND p.isActive = true AND p.price BETWEEN :minPrice AND :maxPrice")
    Page<Product> findByCompany_IdAndPriceBetweenAndIsActive(@Param("companyId") Long companyId, @Param("minPrice") BigDecimal minPrice, @Param("maxPrice") BigDecimal maxPrice, Pageable pageable);

    // Low stock alerts
    @Query("SELECT p FROM Product p WHERE p.company.id = :companyId AND p.isActive = true AND p.stock <= p.minStock AND p.minStock > 0")
    List<Product> findLowStockProducts(@Param("companyId") Long companyId);

    @Query("SELECT p FROM Product p WHERE p.company.id = :companyId AND p.isActive = true AND p.stock = 0")
    List<Product> findOutOfStockProducts(@Param("companyId") Long companyId);

    // Autocomplete for dropdowns
    @Query("SELECT p FROM Product p WHERE p.company.id = :companyId AND p.isActive = true AND " +
           "(LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.barcode) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.sku) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY p.name ASC")
    List<Product> autocomplete(@Param("companyId") Long companyId, @Param("query") String query, Pageable pageable);

    // Count operations for statistics
    long countByCompany_IdAndIsActive(Long companyId, Boolean isActive);

    long countByCompany_IdAndStatusAndIsActive(Long companyId, Product.ProductStatus status, Boolean isActive);

    long countByCompany_IdAndCategory_IdAndIsActive(Long companyId, Long categoryId, Boolean isActive);

    long countByCompany_IdAndSupplier_IdAndIsActive(Long companyId, Long supplierId, Boolean isActive);

    // Complex search with multiple filters
    @Query("SELECT p FROM Product p WHERE p.company.id = :companyId AND p.isActive = true AND " +
           "(:categoryId IS NULL OR p.category.id = :categoryId) AND " +
           "(:supplierId IS NULL OR p.supplier.id = :supplierId) AND " +
           "(:status IS NULL OR p.status = :status) AND " +
           "(:minPrice IS NULL OR p.price >= :minPrice) AND " +
           "(:maxPrice IS NULL OR p.price <= :maxPrice) AND " +
           "(:minStock IS NULL OR p.stock >= :minStock) AND " +
           "(:maxStock IS NULL OR p.stock <= :maxStock) AND " +
           "(:query IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.description) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.brand) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.barcode) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(p.sku) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Product> advancedSearch(
            @Param("companyId") Long companyId,
            @Param("query") String query,
            @Param("categoryId") Long categoryId,
            @Param("supplierId") Long supplierId,
            @Param("status") Product.ProductStatus status,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("minStock") Integer minStock,
            @Param("maxStock") Integer maxStock,
            Pageable pageable);

    // Sort and order queries
    @Query("SELECT p FROM Product p WHERE p.company.id = :companyId AND p.isActive = true ORDER BY p.name ASC")
    Page<Product> findAllOrderByName(@Param("companyId") Long companyId, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.company.id = :companyId AND p.isActive = true ORDER BY p.createdAt DESC")
    Page<Product> findAllOrderByCreatedAt(@Param("companyId") Long companyId, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.company.id = :companyId AND p.isActive = true ORDER BY p.updatedAt DESC")
    Page<Product> findAllOrderByUpdatedAt(@Param("companyId") Long companyId, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.company.id = :companyId AND p.isActive = true ORDER BY p.stock ASC")
    Page<Product> findAllOrderByStock(@Param("companyId") Long companyId, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE p.company.id = :companyId AND p.isActive = true ORDER BY p.price ASC")
    Page<Product> findAllOrderByPrice(@Param("companyId") Long companyId, Pageable pageable);
}