package fa.academy.kiotviet.application.dto.productcatalog.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Response DTO for category data.
 * Includes both basic category info and hierarchy details.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CategoryDto {
    private Long id;
    private String name;
    private String description;
    private String path;
    private Long parentId;
    private Integer level;
    private Integer sortOrder;
    private String color;
    private String icon;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Hierarchy helpers (computed)
    private String displayName;        // Just the name
    private String fullPathName;      // Full breadcrumb path
    private Boolean isRoot;           // True if no parent
    private Boolean isLeaf;           // True if no children
    private Integer descendantCount;  // Number of direct + indirect children
    private String parentName;        // Parent category name for display
    private List<CategoryDto> children; // Direct children (for tree response)
}