package fa.academy.kiotviet.core.productcatalog.repository;

import fa.academy.kiotviet.core.productcatalog.domain.Brand;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for Brand entities with multi-tenant support.
 * Provides comprehensive query methods for brand management operations.
 */
@Repository
public interface BrandRepository extends JpaRepository<Brand, Long>, JpaSpecificationExecutor<Brand> {

    // Basic CRUD with tenant isolation
    Optional<Brand> findByIdAndCompany_Id(Long id, Long companyId);

    Page<Brand> findByCompany_Id(Long companyId, Pageable pageable);

    List<Brand> findByCompany_Id(Long companyId);

    // Active status queries
    List<Brand> findByCompany_IdAndIsActiveTrue(Long companyId);

    List<Brand> findByCompany_IdAndIsActiveFalse(Long companyId);

    Page<Brand> findByCompany_IdAndIsActiveTrue(Long companyId, Pageable pageable);

    // Unique constraint validation
    boolean existsByCompany_IdAndNameIgnoreCase(Long companyId, String name);

    boolean existsByCompany_IdAndNameIgnoreCaseAndIdNot(Long companyId, String name, Long excludeId);

    // Search functionality
    @Query("select b from Brand b where b.company.id = :companyId and " +
           "(lower(b.name) like lower(concat('%', :q, '%')) or " +
           "lower(b.description) like lower(concat('%', :q, '%'))) " +
           "order by b.name asc")
    List<Brand> searchBrands(@Param("companyId") Long companyId, @Param("q") String q, Pageable pageable);

    @Query("select b from Brand b where b.company.id = :companyId and b.isActive = true and " +
           "(lower(b.name) like lower(concat('%', :q, '%')) or " +
           "lower(b.description) like lower(concat('%', :q, '%'))) " +
           "order by b.name asc")
    List<Brand> searchActiveBrands(@Param("companyId") Long companyId, @Param("q") String q, Pageable pageable);

    // Autocomplete functionality
    @Query("select b from Brand b where b.company.id = :companyId and b.isActive = true and " +
           "lower(b.name) like lower(concat(:q, '%')) order by b.name asc")
    List<Brand> autocompleteBrandNames(@Param("companyId") Long companyId, @Param("q") String q, Pageable pageable);

    // Website-related queries
    List<Brand> findByCompany_IdAndWebsiteIsNotNull(Long companyId);

    List<Brand> findByCompany_IdAndWebsiteIsNotNullAndIsActiveTrue(Long companyId);

    // Logo-related queries
    List<Brand> findByCompany_IdAndLogoUrlIsNotNull(Long companyId);

    List<Brand> findByCompany_IdAndLogoUrlIsNotNullAndIsActiveTrue(Long companyId);

    // Count queries for reporting
    long countByCompany_IdAndIsActiveTrue(Long companyId);

    long countByCompany_IdAndIsActiveFalse(Long companyId);

    long countByCompany_IdAndWebsiteIsNotNull(Long companyId);

    long countByCompany_IdAndLogoUrlIsNotNull(Long companyId);

    // Batch operations
    List<Brand> findByCompany_IdAndIdIn(Long companyId, List<Long> ids);

    // Alphabetical queries
    List<Brand> findByCompany_IdAndNameStartingWithIgnoreCase(Long companyId, String letter);

    @Query("select b from Brand b where b.company.id = :companyId and b.isActive = true " +
           "order by b.name asc")
    List<Brand> findAllActiveBrandsOrderByName(@Param("companyId") Long companyId);
}