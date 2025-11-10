package fa.academy.kiotviet.core.productcatalog.service;

import fa.academy.kiotviet.core.productcatalog.domain.Category;
import fa.academy.kiotviet.core.productcatalog.repository.CategoryRepository;
import fa.academy.kiotviet.core.shared.exception.ResourceNotFoundException;
import fa.academy.kiotviet.core.tenant.domain.Company;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing hierarchical categories with materialized path.
 * Handles tree operations, path management, and business validation.
 */
@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private static final int MAX_HIERARCHY_DEPTH = 10;
    private static final int MAX_CATEGORY_NAME_LENGTH = 255;

    /**
     * Get all categories for a company as a flat list (for tree building in frontend)
     */
    public List<Category> getAllCategories(Long companyId) {
        return categoryRepository.findByCompany_IdAndIsActiveOrderByLevelAscSortOrderAscNameAsc(companyId, true);
    }

    /**
     * Get root categories (level 0) for a company
     */
    public List<Category> getRootCategories(Long companyId) {
        return categoryRepository.findByCompany_IdAndLevelAndIsActiveOrderBySortOrderAscNameAsc(companyId, 0, true);
    }

    /**
     * Get direct children of a category
     */
    public List<Category> getChildren(Long companyId, Long parentId) {
        return categoryRepository.findByCompany_IdAndParentIdAndIsActiveOrderBySortOrderAscNameAsc(companyId, parentId, true);
    }

    /**
     * Get all descendants of a category (direct and indirect children)
     */
    public List<Category> getDescendants(Long companyId, Long categoryId) {
        Category category = getCategory(companyId, categoryId);
        String pathPrefix = category.getPath() + "/";
        return categoryRepository.findByCompany_IdAndPathStartingWithAndIsActiveOrderByPathAsc(companyId, pathPrefix, true);
    }

    /**
     * Get a single category by ID
     */
    public Category getCategory(Long companyId, Long categoryId) {
        return categoryRepository.findByIdAndCompany_Id(categoryId, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found", "CATEGORY_NOT_FOUND"));
    }

    /**
     * Create a new root category (no parent)
     */
    @Transactional
    public Category createRootCategory(Long companyId, String name, String description, String color, String icon) {
        validateCategoryName(name, null, companyId);

        // Generate path for root category
        String normalizedName = normalizePathSegment(name);
        String path = "/" + normalizedName;

        // Check for path uniqueness
        if (categoryRepository.existsByCompany_IdAndPath(companyId, path)) {
            throw new IllegalArgumentException("Category with this name already exists");
        }

        // Get sort order for root level
        int sortOrder = categoryRepository.getMaxSortOrder(companyId, null) + 1;

        Category category = Category.builder()
                .company(Company.builder().id(companyId).build())
                .name(name.trim())
                .description(description)
                .path(path)
                .parentId(null)
                .level(0)
                .sortOrder(sortOrder)
                .color(color)
                .icon(icon)
                .isActive(true)
                .build();

        return categoryRepository.save(category);
    }

    /**
     * Create a new subcategory under a parent
     */
    @Transactional
    public Category createSubCategory(Long companyId, Long parentId, String name, String description, String color, String icon) {
        Category parent = getCategory(companyId, parentId);

        // Validate hierarchy depth
        if (parent.getLevel() >= MAX_HIERARCHY_DEPTH - 1) {
            throw new IllegalArgumentException("Maximum hierarchy depth reached");
        }

        validateCategoryName(name, parentId, companyId);

        // Generate path for subcategory
        String normalizedName = normalizePathSegment(name);
        String path = parent.getPath() + "/" + normalizedName;

        // Check for path uniqueness
        if (categoryRepository.existsByCompany_IdAndPath(companyId, path)) {
            throw new IllegalArgumentException("Category with this name already exists under this parent");
        }

        // Get sort order for this parent
        int sortOrder = categoryRepository.getMaxSortOrder(companyId, parentId) + 1;

        Category category = Category.builder()
                .company(Company.builder().id(companyId).build())
                .name(name.trim())
                .description(description)
                .path(path)
                .parentId(parentId)
                .level(parent.getLevel() + 1)
                .sortOrder(sortOrder)
                .color(color)
                .icon(icon)
                .isActive(true)
                .build();

        return categoryRepository.save(category);
    }

    /**
     * Update category details (not hierarchy changes)
     */
    @Transactional
    public Category updateCategory(Long companyId, Long categoryId, String name, String description, String color, String icon) {
        Category category = getCategory(companyId, categoryId);

        // Validate name change
        if (name != null && !name.trim().equals(category.getName())) {
            validateCategoryName(name, category.getParentId(), companyId);

            // Update path if name changed (affects all descendants)
            String newPath = generateNewPathForNameChange(category, name.trim());
            updatePathForCategoryAndDescendants(category, newPath);
            category.setName(name.trim());
        }

        if (description != null) category.setDescription(description);
        if (color != null) category.setColor(color);
        if (icon != null) category.setIcon(icon);

        return categoryRepository.save(category);
    }

    /**
     * Move a category to a new parent
     */
    @Transactional
    public Category moveCategory(Long companyId, Long categoryId, Long newParentId) {
        Category category = getCategory(companyId, categoryId);
        Category newParent = newParentId != null ? getCategory(companyId, newParentId) : null;

        // Prevent moving category under itself or its descendants
        if (newParent != null && wouldCreateCycle(category, newParent)) {
            throw new IllegalArgumentException("Cannot move category under itself or its descendants");
        }

        // Validate hierarchy depth
        int newLevel = newParent != null ? newParent.getLevel() + 1 : 0;
        int maxDescendantLevel = getMaxDescendantLevel(category);
        if (newLevel + maxDescendantLevel >= MAX_HIERARCHY_DEPTH) {
            throw new IllegalArgumentException("Move would exceed maximum hierarchy depth");
        }

        // Update parent and level
        category.setParentId(newParentId);
        category.setLevel(newLevel);

        // Generate new path and update all descendants
        String newPath = generateNewPathForMove(category, newParent);
        updatePathForCategoryAndDescendants(category, newPath);

        // Update sort order
        int sortOrder = categoryRepository.getMaxSortOrder(companyId, newParentId) + 1;
        category.setSortOrder(sortOrder);

        return categoryRepository.save(category);
    }

    /**
     * Soft delete a category (and all its descendants)
     */
    @Transactional
    public void deleteCategory(Long companyId, Long categoryId) {
        Category category = getCategory(companyId, categoryId);

        // Get all descendants and mark them as inactive
        List<Category> descendants = getDescendants(companyId, categoryId);
        descendants.forEach(desc -> desc.setIsActive(false));
        categoryRepository.saveAll(descendants);

        // Mark the category itself as inactive
        category.setIsActive(false);
        categoryRepository.save(category);
    }

    /**
     * Restore a deleted category (and its descendants)
     */
    @Transactional
    public Category restoreCategory(Long companyId, Long categoryId) {
        Category category = categoryRepository.findByIdAndCompany_Id(categoryId, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found", "CATEGORY_NOT_FOUND"));

        // Check if parent is active before restoring
        if (category.getParentId() != null) {
            Category parent = categoryRepository.findByIdAndCompany_Id(category.getParentId(), companyId)
                    .orElse(null);
            if (parent == null || !parent.getIsActive()) {
                throw new IllegalArgumentException("Cannot restore category because parent is not active");
            }
        }

        // Restore the category
        category.setIsActive(true);

        // Restore all descendants
        List<Category> descendants = categoryRepository.findByCompany_IdAndPathStartingWithOrderByPathAsc(
                companyId, category.getPath() + "/");
        descendants.forEach(desc -> {
            // Only restore if all ancestors are active
            if (areAllAncestorsActive(companyId, desc)) {
                desc.setIsActive(true);
            }
        });

        categoryRepository.saveAll(descendants);
        return categoryRepository.save(category);
    }

    /**
     * Search categories by name
     */
    public List<Category> searchCategories(Long companyId, String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllCategories(companyId);
        }
        return categoryRepository.searchByName(companyId, query.trim());
    }

    /**
     * Reorder categories within the same parent
     */
    @Transactional
    public void reorderCategories(Long companyId, List<Long> categoryIds) {
        for (int i = 0; i < categoryIds.size(); i++) {
            Long categoryId = categoryIds.get(i);
            Category category = getCategory(companyId, categoryId);
            category.setSortOrder(i + 1);
            categoryRepository.save(category);
        }
    }

    // Helper methods

    private void validateCategoryName(String name, Long parentId, Long companyId) {
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Category name cannot be empty");
        }

        String trimmedName = name.trim();
        if (trimmedName.length() > MAX_CATEGORY_NAME_LENGTH) {
            throw new IllegalArgumentException("Category name too long");
        }

        // Check uniqueness within parent
        if (categoryRepository.existsByCompany_IdAndNameIgnoreCaseAndParentId(companyId, trimmedName, parentId)) {
            throw new IllegalArgumentException("Category name already exists at this level");
        }
    }

    private String normalizePathSegment(String segment) {
        return segment.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
    }

    private String generateNewPathForNameChange(Category category, String newName) {
        if (category.getParentId() == null) {
            return "/" + normalizePathSegment(newName);
        } else {
            Category parent = categoryRepository.findById(category.getParentId()).orElse(null);
            if (parent != null) {
                return parent.getPath() + "/" + normalizePathSegment(newName);
            }
        }
        return category.getPath(); // fallback
    }

    private String generateNewPathForMove(Category category, Category newParent) {
        if (newParent == null) {
            return "/" + normalizePathSegment(category.getName());
        } else {
            return newParent.getPath() + "/" + normalizePathSegment(category.getName());
        }
    }

    private void updatePathForCategoryAndDescendants(Category category, String newPath) {
        // Update category path
        String oldPath = category.getPath();
        category.setPath(newPath);

        // Update all descendants
        List<Category> descendants = categoryRepository.findByCompany_IdAndPathStartingWithOrderByPathAsc(
                category.getCompany().getId(), oldPath + "/");

        for (Category descendant : descendants) {
            String descendantPath = descendant.getPath().replace(oldPath, newPath);
            descendant.setPath(descendantPath);

            // Update level if this is a move operation
            if (!oldPath.equals(newPath) && !oldPath.equals(category.getPath())) {
                int levelDiff = newPath.split("/").length - oldPath.split("/").length;
                descendant.setLevel(descendant.getLevel() + levelDiff);
            }
        }

        categoryRepository.saveAll(descendants);
    }

    private boolean wouldCreateCycle(Category category, Category newParent) {
        return newParent.isDescendantOf(category);
    }

    private int getMaxDescendantLevel(Category category) {
        List<Category> descendants = categoryRepository.findByCompany_IdAndPathStartingWithOrderByPathAsc(
                category.getCompany().getId(), category.getPath() + "/");

        return descendants.stream()
                .mapToInt(Category::getLevel)
                .max()
                .orElse(category.getLevel()) - category.getLevel();
    }

    private boolean areAllAncestorsActive(Long companyId, Category category) {
        if (category.getParentId() == null) {
            return true;
        }

        Category parent = categoryRepository.findByIdAndCompany_Id(category.getParentId(), companyId)
                .orElse(null);
        return parent != null && parent.getIsActive() && areAllAncestorsActive(companyId, parent);
    }
}