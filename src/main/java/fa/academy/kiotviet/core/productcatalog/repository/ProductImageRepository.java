package fa.academy.kiotviet.core.productcatalog.repository;

import fa.academy.kiotviet.core.productcatalog.domain.ProductImage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for ProductImage entities with multi-tenant support.
 * Provides comprehensive query methods for product image management operations.
 */
@Repository
public interface ProductImageRepository extends JpaRepository<ProductImage, Long>, JpaSpecificationExecutor<ProductImage> {

    // Basic CRUD with tenant isolation
    Optional<ProductImage> findByIdAndCompany_Id(Long id, Long companyId);

    // Product-based queries
    List<ProductImage> findByProduct_Id(Long productId);

    List<ProductImage> findByProduct_IdOrderByImageOrderAsc(Long productId);

    List<ProductImage> findByProduct_IdAndCompany_Id(Long productId, Long companyId);

    List<ProductImage> findByProduct_IdAndCompany_IdOrderByImageOrderAsc(Long productId, Long companyId);

    // Primary image queries
    Optional<ProductImage> findByProduct_IdAndIsPrimaryTrue(Long productId);

    Optional<ProductImage> findByProduct_IdAndIsPrimaryTrueAndCompany_Id(Long productId, Long companyId);

    List<ProductImage> findByProduct_IdAndIsPrimaryFalse(Long productId);

    List<ProductImage> findByProduct_IdAndIsPrimaryFalseAndCompany_Id(Long productId, Long companyId);

    // Company-based queries
    List<ProductImage> findByCompany_Id(Long companyId);

    // Ordering queries
    List<ProductImage> findByProduct_IdAndImageOrder(Long productId, Integer imageOrder);

    List<ProductImage> findByProduct_IdAndImageOrderGreaterThanOrderByImageOrderAsc(Long productId, Integer imageOrder);

    List<ProductImage> findByProduct_IdAndImageOrderLessThanOrderByImageOrderDesc(Long productId, Integer imageOrder);

    // Count queries
    long countByProduct_Id(Long productId);

    long countByProduct_IdAndCompany_Id(Long productId, Long companyId);

    long countByProduct_IdAndIsPrimaryTrue(Long productId);

    long countByProduct_IdAndIsPrimaryFalse(Long productId);

    // Max/min order queries
    @Query("select max(pi.imageOrder) from ProductImage pi where pi.product.id = :productId")
    Integer findMaxImageOrderByProductId(@Param("productId") Long productId);

    @Query("select min(pi.imageOrder) from ProductImage pi where pi.product.id = :productId")
    Integer findMinImageOrderByProductId(@Param("productId") Long productId);

    // Reordering support
    @Query("select pi from ProductImage pi where pi.product.id = :productId and pi.imageOrder >= :startOrder order by pi.imageOrder asc")
    List<ProductImage> findByProductIdAndImageOrderGreaterThanEqualOrderByImageOrderAsc(
            @Param("productId") Long productId, @Param("startOrder") Integer startOrder);

    // Batch operations
    List<ProductImage> findByProduct_IdAndIdIn(Long productId, List<Long> ids);

    List<ProductImage> findByCompany_IdAndIdIn(Long companyId, List<Long> ids);

    // Company and product combined queries
    @Query("select pi from ProductImage pi where pi.company.id = :companyId and pi.product.id = :productId order by pi.imageOrder asc")
    List<ProductImage> findByCompanyIdAndProductIdOrderByImageOrderAsc(
            @Param("companyId") Long companyId, @Param("productId") Long productId);

    // Primary image management queries
    @Query("select pi from ProductImage pi where pi.company.id = :companyId and pi.isPrimary = true order by pi.product.name asc")
    List<ProductImage> findAllPrimaryImagesByCompanyId(@Param("companyId") Long companyId);

    // File size related queries
    @Query("select pi from ProductImage pi where pi.company.id = :companyId and pi.fileSize > :size order by pi.fileSize desc")
    List<ProductImage> findByCompanyIdAndFileSizeGreaterThan(@Param("companyId") Long companyId, @Param("size") Long size);

    // For cleanup operations
    List<ProductImage> findByProduct_IdAndCompany_IdAndIsPrimaryFalse(Long productId, Long companyId);

    // Search by alt text
    @Query("select pi from ProductImage pi where pi.company.id = :companyId and lower(pi.altText) like lower(concat('%', :q, '%'))")
    List<ProductImage> searchByAltText(@Param("companyId") Long companyId, @Param("q") String q);
}