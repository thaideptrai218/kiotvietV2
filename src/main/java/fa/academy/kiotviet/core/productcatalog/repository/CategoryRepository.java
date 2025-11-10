package fa.academy.kiotviet.core.productcatalog.repository;

import fa.academy.kiotviet.core.productcatalog.domain.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for Category entities with hierarchical query support.
 * Provides methods for tree operations and path-based queries.
 */
@Repository
public interface CategoryRepository extends JpaRepository<Category, Long>, JpaSpecificationExecutor<Category> {

    // Basic account isolation queries
    Optional<Category> findByIdAndCompany_Id(Long id, Long companyId);

    List<Category> findByCompany_IdAndIsActiveOrderByLevelAscSortOrderAscNameAsc(Long companyId, Boolean isActive);

    List<Category> findByCompany_IdAndParentIdOrderBySortOrderAscNameAsc(Long companyId, Long parentId);

    List<Category> findByCompany_IdAndParentIdAndIsActiveOrderBySortOrderAscNameAsc(Long companyId, Long parentId, Boolean isActive);

    // Root categories (level 0)
    List<Category> findByCompany_IdAndLevelAndIsActiveOrderBySortOrderAscNameAsc(Long companyId, Integer level, Boolean isActive);

    // Path-based queries for hierarchy operations
    List<Category> findByCompany_IdAndPathStartingWithOrderByPathAsc(Long companyId, String pathPrefix);

    List<Category> findByCompany_IdAndPathStartingWithAndIsActiveOrderByPathAsc(Long companyId, String pathPrefix, Boolean isActive);

    // Search queries
    @Query("SELECT c FROM Category c WHERE c.company.id = :companyId AND c.isActive = true AND " +
           "LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) ORDER BY c.level ASC, c.name ASC")
    List<Category> searchByName(@Param("companyId") Long companyId, @Param("query") String query);

    // Simple search (full-text can be added later when MySQL is configured)
    @Query("SELECT c FROM Category c WHERE c.company.id = :companyId AND c.isActive = true AND " +
           "LOWER(c.name) LIKE LOWER(CONCAT('%', :query, '%')) ORDER BY c.level ASC, c.sortOrder ASC, c.name ASC")
    List<Category> fullTextSearch(@Param("companyId") Long companyId, @Param("query") String query);

    // Uniqueness validation queries
    boolean existsByCompany_IdAndNameIgnoreCaseAndParentId(Long companyId, String name, Long parentId);

    boolean existsByCompany_IdAndPath(Long companyId, String path);

    // Hierarchy-specific queries
    @Query("SELECT c FROM Category c WHERE c.company.id = :companyId AND c.parentId = :parentId AND c.isActive = true")
    List<Category> findActiveChildren(@Param("companyId") Long companyId, @Param("parentId") Long parentId);

    @Query("SELECT COUNT(c) FROM Category c WHERE c.company.id = :companyId AND c.parentId = :parentId AND c.isActive = true")
    long countActiveChildren(@Param("companyId") Long companyId, @Param("parentId") Long parentId);

    @Query("SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END FROM Category c WHERE c.company.id = :companyId AND c.parentId = :categoryId AND c.isActive = true")
    boolean hasActiveChildren(@Param("companyId") Long companyId, @Param("categoryId") Long categoryId);

    // Path manipulation queries
    @Query(value = "SELECT c FROM Category c WHERE c.company.id = :companyId AND c.path LIKE :pathPattern ORDER BY c.path ASC")
    List<Category> findByPathPattern(@Param("companyId") Long companyId, @Param("pathPattern") String pathPattern);

    // Get all descendants of a category (using path prefix)
    @Query("SELECT c FROM Category c WHERE c.company.id = :companyId AND c.path LIKE :pathPrefix AND c.id != :categoryId ORDER BY c.path ASC")
    List<Category> findDescendants(@Param("companyId") Long companyId, @Param("pathPrefix") String pathPrefix, @Param("categoryId") Long categoryId);

    // Get max sort order for a parent (for ordering new categories)
    @Query("SELECT COALESCE(MAX(c.sortOrder), 0) FROM Category c WHERE c.company.id = :companyId AND c.parentId = :parentId")
    int getMaxSortOrder(@Param("companyId") Long companyId, @Param("parentId") Long parentId);

    // Get max level in company (for hierarchy depth validation)
    @Query("SELECT COALESCE(MAX(c.level), 0) FROM Category c WHERE c.company.id = :companyId")
    int getMaxLevel(@Param("companyId") Long companyId);

    // Count categories by level
    @Query("SELECT COUNT(c) FROM Category c WHERE c.company.id = :companyId AND c.level = :level AND c.isActive = true")
    long countByLevel(@Param("companyId") Long companyId, @Param("level") Integer level);

    // Check if category can be moved to new parent (prevent cycles)
    @Query("SELECT COUNT(c) > 0 FROM Category c WHERE c.company.id = :companyId AND c.path LIKE :pathPrefix AND c.id = :newParentId")
    boolean wouldCreateCycle(@Param("companyId") Long companyId, @Param("pathPrefix") String pathPrefix, @Param("newParentId") Long newParentId);
}