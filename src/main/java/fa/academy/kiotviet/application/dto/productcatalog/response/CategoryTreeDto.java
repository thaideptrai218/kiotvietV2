package fa.academy.kiotviet.application.dto.productcatalog.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response DTO for category tree structure.
 * Used when the full hierarchy needs to be returned.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryTreeDto {
    private List<CategoryDto> categories;      // Flat list for tree building
    private List<CategoryDto> rootCategories;  // Root level categories only
    private Integer totalCategories;           // Total count of active categories
    private Integer maxDepth;                  // Maximum hierarchy depth
    private Boolean hasHierarchy;              // True if there are subcategories
}