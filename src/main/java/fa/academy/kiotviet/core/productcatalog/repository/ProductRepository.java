package fa.academy.kiotviet.core.productcatalog.repository;

import fa.academy.kiotviet.core.productcatalog.domain.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import jakarta.persistence.LockModeType;

import java.util.List;
import java.util.Optional;

/**
 * Repository for Product entities with multi-tenant support.
 * Provides comprehensive query methods for product management operations.
 */
@Repository
public interface ProductRepository extends JpaRepository<Product, Long>, JpaSpecificationExecutor<Product> {

    // Basic CRUD with tenant isolation
    Optional<Product> findByIdAndCompany_Id(Long id, Long companyId);

    // For inventory updates: lock product row to avoid concurrent stock increments
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    Optional<Product> findWithLockByIdAndCompany_Id(Long id, Long companyId);

    Page<Product> findByCompany_Id(Long companyId, Pageable pageable);

    List<Product> findByCompany_Id(Long companyId);

    // Unique constraint validation
    boolean existsByCompany_IdAndSkuIgnoreCase(Long companyId, String sku);

    boolean existsByCompany_IdAndBarcodeIgnoreCase(Long companyId, String barcode);

    boolean existsByCompany_IdAndSkuIgnoreCaseAndIdNot(Long companyId, String sku, Long excludeId);

    boolean existsByCompany_IdAndBarcodeIgnoreCaseAndIdNot(Long companyId, String barcode, Long excludeId);

    // Status-based queries
    List<Product> findByCompany_IdAndStatus(Long companyId, Product.ProductStatus status);

    List<Product> findByCompany_IdAndStatusIn(Long companyId, List<Product.ProductStatus> statuses);

    List<Product> findByCompany_IdAndIsTrackedTrue(Long companyId);

    // Category-based queries
    List<Product> findByCompany_IdAndCategoryId(Long companyId, Long categoryId);

    Page<Product> findByCompany_IdAndCategoryId(Long companyId, Long categoryId, Pageable pageable);

    // Supplier-based queries
    List<Product> findByCompany_IdAndSupplierId(Long companyId, Long supplierId);

    // Brand-based queries
    List<Product> findByCompany_IdAndBrandId(Long companyId, Long brandId);

    // Stock-related queries
    @Query("select p from Product p where p.company.id = :companyId and p.isTracked = true and p.onHand <= p.minLevel")
    List<Product> findByCompany_IdAndOnHandLessThanMinLevel(@Param("companyId") Long companyId);

    @Query("select p from Product p where p.company.id = :companyId and p.isTracked = true and " +
           "p.onHand <= p.minLevel order by p.onHand asc")
    List<Product> findLowStockProducts(@Param("companyId") Long companyId);

    @Query("select p from Product p where p.company.id = :companyId and p.isTracked = true and " +
           "p.onHand > p.maxLevel and p.maxLevel > 0 order by p.onHand desc")
    List<Product> findOverstockedProducts(@Param("companyId") Long companyId);

    @Query("select p from Product p where p.company.id = :companyId and p.onHand = 0 order by p.name asc")
    List<Product> findOutOfStockProducts(@Param("companyId") Long companyId);

    // Search functionality
    @Query("select p from Product p where p.company.id = :companyId and " +
           "(lower(p.name) like lower(concat('%', :q, '%')) or " +
           "lower(p.sku) like lower(concat('%', :q, '%')) or " +
           "lower(p.barcode) like lower(concat('%', :q, '%'))) " +
           "order by p.name asc")
    List<Product> searchProducts(@Param("companyId") Long companyId, @Param("q") String q, Pageable pageable);

    @Query("select p from Product p where p.company.id = :companyId and p.status = :status and " +
           "(lower(p.name) like lower(concat('%', :q, '%')) or " +
           "lower(p.sku) like lower(concat('%', :q, '%'))) " +
           "order by p.name asc")
    List<Product> searchActiveProducts(@Param("companyId") Long companyId,
                                      @Param("status") Product.ProductStatus status,
                                      @Param("q") String q,
                                      Pageable pageable);

    // Full-text search using MySQL FULLTEXT index
    @Query(value = "select p.* from products p where p.company_id = :companyId and " +
                   "match(p.name, p.description) against(:q IN NATURAL LANGUAGE MODE) " +
                   "order by p.name asc", nativeQuery = true)
    List<Product> fullTextSearch(@Param("companyId") Long companyId, @Param("q") String q, Pageable pageable);

    // Price-based queries
    @Query("select p from Product p where p.company.id = :companyId and p.sellingPrice between :minPrice and :maxPrice")
    List<Product> findByPriceRange(@Param("companyId") Long companyId,
                                 @Param("minPrice") java.math.BigDecimal minPrice,
                                 @Param("maxPrice") java.math.BigDecimal maxPrice);

    // Autocomplete functionality
    @Query("select p from Product p where p.company.id = :companyId and p.status = 'ACTIVE' and " +
           "lower(p.name) like lower(concat(:q, '%')) order by p.name asc")
    List<Product> autocompleteProductNames(@Param("companyId") Long companyId, @Param("q") String q, Pageable pageable);

    @Query("select p from Product p where p.company.id = :companyId and p.status = 'ACTIVE' and p.supplier.id = :supplierId and " +
           "lower(p.name) like lower(concat(:q, '%')) order by p.name asc")
    List<Product> autocompleteProductNamesBySupplier(@Param("companyId") Long companyId,
                                                    @Param("supplierId") Long supplierId,
                                                    @Param("q") String q,
                                                    Pageable pageable);

    @Query("select p from Product p where p.company.id = :companyId and p.status = 'ACTIVE' and " +
           "lower(p.sku) like lower(concat(:q, '%')) order by p.sku asc")
    List<Product> autocompleteSkus(@Param("companyId") Long companyId, @Param("q") String q, Pageable pageable);

    // Count queries for reporting
    long countByCompany_IdAndStatus(Long companyId, Product.ProductStatus status);

    long countByCompany_IdAndCategoryId(Long companyId, Long categoryId);

    long countByCompany_IdAndSupplierId(Long companyId, Long supplierId);

    long countByCompany_IdAndBrandId(Long companyId, Long brandId);

    @Query("select count(p) from Product p where p.company.id = :companyId and p.onHand = 0")
    long countOutOfStockProducts(@Param("companyId") Long companyId);

    @Query("select count(p) from Product p where p.company.id = :companyId and p.isTracked = true and p.onHand <= p.minLevel")
    long countLowStockProducts(@Param("companyId") Long companyId);

    // Batch operations
    List<Product> findByCompany_IdAndIdIn(Long companyId, List<Long> ids);
}
