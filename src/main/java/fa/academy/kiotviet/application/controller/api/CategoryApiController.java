package fa.academy.kiotviet.application.controller.api;

import fa.academy.kiotviet.application.dto.shared.SuccessResponse;
import fa.academy.kiotviet.application.dto.productcatalog.request.*;
import fa.academy.kiotviet.application.dto.productcatalog.response.*;
import fa.academy.kiotviet.application.service.ResponseFactory;
import fa.academy.kiotviet.core.productcatalog.domain.Category;
import fa.academy.kiotviet.core.productcatalog.service.CategoryService;
import fa.academy.kiotviet.infrastructure.security.JwtAuthenticationFilter;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * REST API controller for category management.
 * Provides endpoints for CRUD operations and hierarchy management.
 */
@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class CategoryApiController {

    private final CategoryService categoryService;

    /**
     * Get all categories as flat list (for tree building in frontend)
     */
    @GetMapping
    public SuccessResponse<CategoryTreeDto> getAllCategories() {
        Long companyId = currentCompanyId();
        List<Category> categories = categoryService.getAllCategories(companyId);

        List<CategoryDto> categoryDtos = categories.stream()
                .map(this::toCategoryDto)
                .collect(Collectors.toList());

        List<CategoryDto> rootCategories = categoryDtos.stream()
                .filter(CategoryDto::getIsRoot)
                .collect(Collectors.toList());

        Integer maxDepth = categoryDtos.stream()
                .mapToInt(dto -> dto.getLevel() + 1)
                .max()
                .orElse(1);

        CategoryTreeDto response = CategoryTreeDto.builder()
                .categories(categoryDtos)
                .rootCategories(rootCategories)
                .totalCategories(categoryDtos.size())
                .maxDepth(maxDepth)
                .hasHierarchy(maxDepth > 1)
                .build();

        return ResponseFactory.success(response, "Categories retrieved successfully");
    }

    /**
     * Get root categories (level 0 only)
     */
    @GetMapping("/root")
    public SuccessResponse<List<CategoryDto>> getRootCategories() {
        Long companyId = currentCompanyId();
        List<Category> rootCategories = categoryService.getRootCategories(companyId);
        List<CategoryDto> response = rootCategories.stream()
                .map(this::toCategoryDto)
                .collect(Collectors.toList());
        return ResponseFactory.success(response, "Root categories retrieved successfully");
    }

    /**
     * Get direct children of a category
     */
    @GetMapping("/{id}/children")
    public SuccessResponse<List<CategoryDto>> getChildren(@PathVariable Long id) {
        Long companyId = currentCompanyId();
        List<Category> children = categoryService.getChildren(companyId, id);
        List<CategoryDto> response = children.stream()
                .map(this::toCategoryDto)
                .collect(Collectors.toList());
        return ResponseFactory.success(response, "Child categories retrieved successfully");
    }

    /**
     * Get all descendants of a category (direct + indirect children)
     */
    @GetMapping("/{id}/descendants")
    public SuccessResponse<List<CategoryDto>> getDescendants(@PathVariable Long id) {
        Long companyId = currentCompanyId();
        List<Category> descendants = categoryService.getDescendants(companyId, id);
        List<CategoryDto> response = descendants.stream()
                .map(this::toCategoryDto)
                .collect(Collectors.toList());
        return ResponseFactory.success(response, "Category descendants retrieved successfully");
    }

    /**
     * Get a single category by ID
     */
    @GetMapping("/{id}")
    public SuccessResponse<CategoryDto> getCategory(@PathVariable Long id) {
        Long companyId = currentCompanyId();
        Category category = categoryService.getCategory(companyId, id);
        CategoryDto response = toCategoryDto(category);
        return ResponseFactory.success(response, "Category retrieved successfully");
    }

    /**
     * Create a new category (root or subcategory)
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER') or hasAuthority('PRODUCT_MANAGE')")
    public SuccessResponse<CategoryDto> createCategory(@Valid @RequestBody CategoryCreateRequest request) {
        Long companyId = currentCompanyId();

        Category category;
        if (request.getParentId() == null) {
            // Create root category
            category = categoryService.createRootCategory(
                    companyId,
                    request.getName(),
                    request.getDescription(),
                    request.getColor(),
                    request.getIcon()
            );
        } else {
            // Create subcategory
            category = categoryService.createSubCategory(
                    companyId,
                    request.getParentId(),
                    request.getName(),
                    request.getDescription(),
                    request.getColor(),
                    request.getIcon()
            );
        }

        CategoryDto response = toCategoryDto(category);
        return ResponseFactory.created(response, "Category created successfully");
    }

    /**
     * Update category details (not hierarchy changes)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER') or hasAuthority('PRODUCT_MANAGE')")
    public SuccessResponse<CategoryDto> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryUpdateRequest request) {
        Long companyId = currentCompanyId();

        Category category = categoryService.updateCategory(
                companyId,
                id,
                request.getName(),
                request.getDescription(),
                request.getColor(),
                request.getIcon()
        );

        CategoryDto response = toCategoryDto(category);
        return ResponseFactory.success(response, "Category updated successfully");
    }

    /**
     * Move a category to a new parent
     */
    @PutMapping("/{id}/move")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER') or hasAuthority('PRODUCT_MANAGE')")
    public SuccessResponse<CategoryDto> moveCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryMoveRequest request) {
        Long companyId = currentCompanyId();

        Category category = categoryService.moveCategory(
                companyId,
                id,
                request.getNewParentId()
        );

        CategoryDto response = toCategoryDto(category);
        return ResponseFactory.success(response, "Category moved successfully");
    }

    /**
     * Soft delete a category (and all its descendants)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER') or hasAuthority('PRODUCT_MANAGE')")
    public SuccessResponse<String> deleteCategory(@PathVariable Long id) {
        Long companyId = currentCompanyId();
        categoryService.deleteCategory(companyId, id);
        return ResponseFactory.success("Category deleted successfully");
    }

    /**
     * Restore a deleted category (and its descendants)
     */
    @PutMapping("/{id}/restore")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER') or hasAuthority('PRODUCT_MANAGE')")
    public SuccessResponse<CategoryDto> restoreCategory(@PathVariable Long id) {
        Long companyId = currentCompanyId();
        Category category = categoryService.restoreCategory(companyId, id);
        CategoryDto response = toCategoryDto(category);
        return ResponseFactory.success(response, "Category restored successfully");
    }

    /**
     * Search categories by name
     */
    @GetMapping("/search")
    public SuccessResponse<List<CategoryDto>> searchCategories(@RequestParam String query) {
        Long companyId = currentCompanyId();
        List<Category> categories = categoryService.searchCategories(companyId, query);
        List<CategoryDto> response = categories.stream()
                .map(this::toCategoryDto)
                .collect(Collectors.toList());
        return ResponseFactory.success(response, "Categories search completed");
    }

    /**
     * Reorder categories within the same parent level
     */
    @PutMapping("/reorder")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER') or hasAuthority('PRODUCT_MANAGE')")
    public SuccessResponse<String> reorderCategories(@Valid @RequestBody CategoryReorderRequest request) {
        Long companyId = currentCompanyId();
        categoryService.reorderCategories(companyId, request.getCategoryIds());
        return ResponseFactory.success("Categories reordered successfully");
    }

    // Helper methods

    private CategoryDto toCategoryDto(Category category) {
        // Get descendant count
        int descendantCount = 0;
        try {
            List<Category> descendants = categoryService.getDescendants(category.getCompany().getId(), category.getId());
            descendantCount = descendants.size();
        } catch (Exception e) {
            // Ignore if we can't get descendants
        }

        return CategoryDto.builder()
                .id(category.getId())
                .name(category.getName())
                .description(category.getDescription())
                .path(category.getPath())
                .parentId(category.getParentId())
                .level(category.getLevel())
                .sortOrder(category.getSortOrder())
                .color(category.getColor())
                .icon(category.getIcon())
                .isActive(category.getIsActive())
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .displayName(category.getDisplayName())
                .fullPathName(category.getFullPathName())
                .isRoot(category.isRoot())
                .isLeaf(category.isLeaf())
                .descendantCount(descendantCount)
                .build();
    }

    private Long currentCompanyId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof JwtAuthenticationFilter.UserPrincipal)) {
            throw new IllegalStateException("No authenticated user found");
        }
        JwtAuthenticationFilter.UserPrincipal principal = (JwtAuthenticationFilter.UserPrincipal) auth.getPrincipal();
        return principal.getCompanyId();
    }
}