package fa.academy.kiotviet.core.productcatalog.domain;

import fa.academy.kiotviet.core.tenant.domain.Company;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Category entity for hierarchical product categorization.
 * Uses materialized path pattern for unlimited depth hierarchy support.
 *
 * Path examples:
 * - Root level: "/electronics"
 * - Child: "/electronics/mobile"
 * - Grandchild: "/electronics/mobile/smartphones"
 */
@Entity
@Table(name = "categories",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_company_path", columnNames = {"company_id", "path"}),
        @UniqueConstraint(name = "uk_company_name_level", columnNames = {"company_id", "name", "parent_id"})
    },
    indexes = {
        @Index(name = "idx_company_path", columnList = "company_id,path"),
        @Index(name = "idx_company_parent", columnList = "company_id,parent_id"),
        @Index(name = "idx_company_active", columnList = "company_id,is_active"),
        @Index(name = "idx_company_level", columnList = "company_id,level"),
        @Index(name = "idx_path_descendants", columnList = "path")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false, foreignKey = @ForeignKey(name = "fk_category_company"))
    private Company company;

    @NotBlank
    @Size(max = 255)
    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @NotBlank
    @Size(max = 500)
    @Column(name = "path", nullable = false)
    private String path;

    @Column(name = "parent_id")
    private Long parentId;

    @Column(name = "level", nullable = false)
    @Builder.Default
    private Integer level = 0;

    @Column(name = "sort_order")
    @Builder.Default
    private Integer sortOrder = 0;

    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Color must be a valid hex color")
    @Size(max = 7)
    @Column(name = "color")
    private String color;

    @Size(max = 50)
    @Column(name = "icon")
    private String icon;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id", insertable = false, updatable = false)
    private Category parent;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @OrderBy("sortOrder ASC, name ASC")
    private List<Category> children = new ArrayList<>();

    // Lifecycle methods
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Helper methods for hierarchy management

    /**
     * Check if this category is a root category (has no parent)
     */
    public boolean isRoot() {
        return parentId == null || level == 0;
    }

    /**
     * Check if this category is a leaf category (has no children)
     */
    public boolean isLeaf() {
        return children == null || children.isEmpty();
    }

    /**
     * Get the category name without parent context
     */
    public String getDisplayName() {
        return name;
    }

    /**
     * Get full path display name with breadcrumbs
     * Example: "Electronics > Mobile > Smartphones"
     */
    public String getFullPathName() {
        return path.replace("/", " > ").substring(2); // Remove leading "/>"
    }

    /**
     * Check if this category is a descendant of the given category
     */
    public boolean isDescendantOf(Category potentialParent) {
        if (potentialParent == null || potentialParent.getPath() == null) {
            return false;
        }
        return this.path.startsWith(potentialParent.getPath() + "/");
    }

    /**
     * Check if this category is an ancestor of the given category
     */
    public boolean isAncestorOf(Category potentialChild) {
        return potentialChild != null && potentialChild.isDescendantOf(this);
    }

    /**
     * Generate path for a new child category
     */
    public String generateChildPath(String childName) {
        String normalizedName = normalizePathSegment(childName);
        return this.path + "/" + normalizedName;
    }

    /**
     * Normalize path segment for URL-friendly paths
     */
    private String normalizePathSegment(String segment) {
        if (segment == null) return "";
        return segment.toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
    }

    /**
     * Get the depth level in the hierarchy
     */
    public int getDepth() {
        return this.level;
    }

    /**
     * Get all descendants count (direct + indirect children)
     */
    public int getDescendantsCount() {
        if (isLeaf()) {
            return 0;
        }
        int count = children.size();
        for (Category child : children) {
            count += child.getDescendantsCount();
        }
        return count;
    }
}