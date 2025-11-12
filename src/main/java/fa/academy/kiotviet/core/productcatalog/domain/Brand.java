package fa.academy.kiotviet.core.productcatalog.domain;

import fa.academy.kiotviet.core.tenant.domain.Company;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Brand entity for product brand management.
 * Supports multi-tenant architecture with company-level isolation.
 *
 * Features:
 * - Basic brand information (name, description, website)
 * - Logo URL support for future image upload
 * - Active status management
 * - Company-level uniqueness constraints
 */
@Entity
@Table(name = "brands",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_company_name", columnNames = {"company_id", "name"})
    },
    indexes = {
        @Index(name = "idx_company_name", columnList = "company_id,name"),
        @Index(name = "idx_company_active", columnList = "company_id,is_active")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Brand {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false, foreignKey = @ForeignKey(name = "fk_brand_company"))
    private Company company;

    @NotBlank(message = "Brand name is required")
    @Size(max = 255, message = "Brand name must not exceed 255 characters")
    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Size(max = 500, message = "Website URL must not exceed 500 characters")
    @Pattern(regexp = "^$|^https?://[\\w\\-]+(\\.[\\w\\-]+)+([\\w\\-.,@?^=%&:/~+#]*[\\w\\-@?^=%&/~+#])?$",
             message = "Website must be a valid URL")
    @Column(name = "website")
    private String website;

    @Size(max = 500, message = "Logo URL must not exceed 500 characters")
    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

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

    // Business logic helper methods

    /**
     * Check if brand is currently active
     */
    public boolean isActiveBrand() {
        return Boolean.TRUE.equals(isActive);
    }

    /**
     * Get display name (same as name for now, but allows for future customization)
     */
    public String getDisplayName() {
        return name;
    }

    /**
     * Check if brand has a logo
     */
    public boolean hasLogo() {
        return logoUrl != null && !logoUrl.trim().isEmpty();
    }

    /**
     * Check if brand has a website
     */
    public boolean hasWebsite() {
        return website != null && !website.trim().isEmpty();
    }

    /**
     * Get formatted website URL for display
     */
    public String getDisplayWebsite() {
        if (website == null || website.trim().isEmpty()) {
            return "";
        }
        // Remove http:// or https:// for cleaner display
        return website.replaceAll("^https?://", "");
    }

    /**
     * Check if brand has complete information
     */
    public boolean isComplete() {
        return name != null && !name.trim().isEmpty() &&
               description != null && !description.trim().isEmpty() &&
               website != null && !website.trim().isEmpty();
    }
}