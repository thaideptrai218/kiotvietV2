package fa.academy.kiotviet.core.productcatalog.domain;

import fa.academy.kiotviet.core.suppliers.domain.Supplier;
import fa.academy.kiotviet.core.tenant.domain.Company;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Product entity for comprehensive product management.
 * Supports multi-tenant architecture with company-level isolation.
 *
 * Features:
 * - SKU and barcode tracking
 * - Pricing management (selling/cost prices)
 * - Inventory tracking with min/max levels
 * - Category and supplier relationships
 * - Brand association
 * - Product lifecycle status management
 */
@Entity
@Table(name = "products",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_company_sku", columnNames = {"company_id", "sku"}),
        @UniqueConstraint(name = "uk_company_barcode", columnNames = {"company_id", "barcode"})
    },
    indexes = {
        @Index(name = "idx_company_name", columnList = "company_id,name"),
        @Index(name = "idx_company_category", columnList = "company_id,category_id"),
        @Index(name = "idx_company_supplier", columnList = "company_id,supplier_id"),
        @Index(name = "idx_company_brand", columnList = "company_id,brand_id"),
        @Index(name = "idx_company_status", columnList = "company_id,status"),
        @Index(name = "idx_company_low_stock", columnList = "company_id,on_hand,min_level")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false, foreignKey = @ForeignKey(name = "fk_product_company"))
    private Company company;

    @NotBlank(message = "SKU is required")
    @Size(max = 100, message = "SKU must not exceed 100 characters")
    @Column(name = "sku", nullable = false)
    private String sku;

    @NotBlank(message = "Product name is required")
    @Size(max = 255, message = "Product name must not exceed 255 characters")
    @Column(name = "name", nullable = false)
    private String name;

    @Size(max = 50, message = "Barcode must not exceed 50 characters")
    @Column(name = "barcode")
    private String barcode;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @NotNull(message = "Selling price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Selling price must be greater than 0")
    @Digits(integer = 10, fraction = 2, message = "Selling price must have up to 10 digits and 2 decimal places")
    @Column(name = "selling_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal sellingPrice;

    @NotNull(message = "Cost price is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Cost price must be greater than 0")
    @Digits(integer = 10, fraction = 2, message = "Cost price must have up to 10 digits and 2 decimal places")
    @Column(name = "cost_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal costPrice;

    @Min(value = 0, message = "On hand quantity cannot be negative")
    @Column(name = "on_hand")
    @Builder.Default
    private Integer onHand = 0;

    @Min(value = 0, message = "Minimum level cannot be negative")
    @Column(name = "min_level")
    @Builder.Default
    private Integer minLevel = 0;

    @Min(value = 0, message = "Maximum level cannot be negative")
    @Column(name = "max_level")
    @Builder.Default
    private Integer maxLevel = 0;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private ProductStatus status = ProductStatus.ACTIVE;

    @Column(name = "is_tracked")
    @Builder.Default
    private Boolean isTracked = true;

    // Relationships
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", foreignKey = @ForeignKey(name = "fk_product_category"))
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", foreignKey = @ForeignKey(name = "fk_product_supplier"))
    private Supplier supplier;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "brand_id", foreignKey = @ForeignKey(name = "fk_product_brand"))
    private Brand brand;

    // Timestamps
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
     * Calculate profit margin as percentage
     */
    public BigDecimal getProfitMargin() {
        if (sellingPrice == null || costPrice == null || costPrice.compareTo(BigDecimal.ZERO) <= 0) {
            return BigDecimal.ZERO;
        }
        BigDecimal profit = sellingPrice.subtract(costPrice);
        return profit.divide(costPrice, 4, java.math.RoundingMode.HALF_UP)
                     .multiply(new BigDecimal("100"));
    }

    /**
     * Calculate profit amount
     */
    public BigDecimal getProfitAmount() {
        if (sellingPrice == null || costPrice == null) {
            return BigDecimal.ZERO;
        }
        return sellingPrice.subtract(costPrice);
    }

    /**
     * Check if product is in stock
     */
    public boolean isInStock() {
        return onHand != null && onHand > 0;
    }

    /**
     * Check if stock is below minimum level
     */
    public boolean isLowStock() {
        return minLevel != null && onHand != null && onHand <= minLevel;
    }

    /**
     * Check if stock exceeds maximum level
     */
    public boolean isOverstocked() {
        return maxLevel != null && maxLevel > 0 && onHand != null && onHand >= maxLevel;
    }

    /**
     * Check if product is active and available for sale
     */
    public boolean isAvailable() {
        return status == ProductStatus.ACTIVE && isInStock();
    }

    /**
     * Get stock status description
     */
    public String getStockStatus() {
        if (!isTracked) {
            return "Not Tracked";
        }
        if (isLowStock()) {
            return "Low Stock";
        }
        if (isOverstocked()) {
            return "Overstocked";
        }
        if (isInStock()) {
            return "In Stock";
        }
        return "Out of Stock";
    }

    /**
     * Check if product needs reordering
     */
    public boolean needsReorder() {
        return isTracked && isLowStock();
    }

    /**
     * Calculate recommended reorder quantity
     */
    public int getReorderQuantity() {
        if (!needsReorder() || maxLevel == null || maxLevel == 0) {
            return 0;
        }
        int suggestedOrder = maxLevel - (onHand != null ? onHand : 0);
        return Math.max(suggestedOrder, 1);
    }

    /**
     * Product status enumeration
     */
    public enum ProductStatus {
        ACTIVE("Active"),
        INACTIVE("Inactive"),
        DISCONTINUED("Discontinued");

        private final String displayName;

        ProductStatus(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }
}