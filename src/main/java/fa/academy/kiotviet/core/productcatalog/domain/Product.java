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
import java.math.RoundingMode;
import java.time.LocalDateTime;

/**
 * Product entity for multi-tenant product management.
 * Supports comprehensive product information including categorization,
 * pricing, inventory tracking, and status management.
 */
@Entity
@Table(name = "products",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_company_barcode", columnNames = {"company_id", "barcode"}),
        @UniqueConstraint(name = "uk_company_sku", columnNames = {"company_id", "sku"})
    },
    indexes = {
        @Index(name = "idx_company_name", columnList = "company_id,name"),
        @Index(name = "idx_company_category", columnList = "company_id,category_id"),
        @Index(name = "idx_company_supplier", columnList = "company_id,supplier_id"),
        @Index(name = "idx_company_status", columnList = "company_id,status"),
        @Index(name = "idx_company_barcode", columnList = "company_id,barcode"),
        @Index(name = "idx_company_sku", columnList = "company_id,sku"),
        @Index(name = "idx_company_price", columnList = "company_id,price"),
        @Index(name = "idx_company_stock", columnList = "company_id,stock"),
        @Index(name = "idx_company_created", columnList = "company_id,created_at"),
        @Index(name = "idx_company_category_status", columnList = "company_id,category_id,status"),
        @Index(name = "idx_company_supplier_status", columnList = "company_id,supplier_id,status"),
        @Index(name = "idx_company_status_stock", columnList = "company_id,status,stock")
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

    @Size(max = 50, message = "Barcode must be less than 50 characters")
    @Column(name = "barcode")
    private String barcode;

    @Size(max = 50, message = "SKU must be less than 50 characters")
    @Column(name = "sku")
    private String sku;

    @NotBlank(message = "Product name is required")
    @Size(max = 255, message = "Product name must be less than 255 characters")
    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", foreignKey = @ForeignKey(name = "fk_product_category"))
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", foreignKey = @ForeignKey(name = "fk_product_supplier"))
    private Supplier supplier;

    @DecimalMin(value = "0.00", message = "Price must be non-negative")
    @Digits(integer = 9, fraction = 2, message = "Price must have maximum 9 integer digits and 2 decimal places")
    @Column(name = "price", precision = 12, scale = 2)
    private BigDecimal price;

    @DecimalMin(value = "0.00", message = "Cost price must be non-negative")
    @Digits(integer = 9, fraction = 2, message = "Cost price must have maximum 9 integer digits and 2 decimal places")
    @Column(name = "cost_price", precision = 12, scale = 2)
    private BigDecimal costPrice;

    @Column(name = "taxable")
    @Builder.Default
    private Boolean taxable = false;

    @Min(value = 0, message = "Stock must be non-negative")
    @Column(name = "stock")
    @Builder.Default
    private Integer stock = 0;

    @Min(value = 0, message = "Minimum stock must be non-negative")
    @Column(name = "min_stock")
    @Builder.Default
    private Integer minStock = 0;

    @Min(value = 0, message = "Maximum stock must be non-negative")
    @Column(name = "max_stock")
    private Integer maxStock;

    @Size(max = 50, message = "Unit must be less than 50 characters")
    @Column(name = "unit")
    private String unit;

    @Size(max = 100, message = "Brand must be less than 100 characters")
    @Column(name = "brand")
    private String brand;

    @Size(max = 500, message = "Tags must be less than 500 characters")
    @Column(name = "tags")
    private String tags;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private ProductStatus status = ProductStatus.ACTIVE;

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

    // Helper methods for business logic

    /**
     * Check if product is currently active and available for sale
     */
    public boolean isAvailable() {
        return isActive && status == ProductStatus.ACTIVE;
    }

    /**
     * Check if stock is below minimum threshold
     */
    public boolean isLowStock() {
        return minStock != null && stock <= minStock;
    }

    /**
     * Check if stock is out of stock
     */
    public boolean isOutOfStock() {
        return stock <= 0;
    }

    /**
     * Calculate profit margin
     */
    public BigDecimal getProfitMargin() {
        if (price == null || costPrice == null || costPrice.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return price.subtract(costPrice)
                .divide(costPrice, 4, RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"));
    }

    /**
     * Get display name with SKU if available
     */
    public String getDisplayName() {
        if (sku != null && !sku.trim().isEmpty()) {
            return String.format("%s (%s)", name, sku);
        }
        return name;
    }

    /**
     * Get formatted price display
     */
    public String getFormattedPrice() {
        if (price == null) {
            return "0.00";
        }
        return price.toString();
    }

    /**
     * Get formatted cost price display
     */
    public String getFormattedCostPrice() {
        if (costPrice == null) {
            return "0.00";
        }
        return costPrice.toString();
    }

    /**
     * Check if this product belongs to the specified category or its descendants
     */
    public boolean belongsToCategory(Category category) {
        if (this.category == null || category == null) {
            return false;
        }

        // Direct match
        if (this.category.getId().equals(category.getId())) {
            return true;
        }

        // Check if product's category is a descendant of the given category
        return this.category.isDescendantOf(category);
    }

    /**
     * Get stock status indicator
     */
    public StockStatus getStockStatus() {
        if (isOutOfStock()) {
            return StockStatus.OUT_OF_STOCK;
        } else if (isLowStock()) {
            return StockStatus.LOW_STOCK;
        } else {
            return StockStatus.IN_STOCK;
        }
    }

    /**
     * Product status enumeration
     */
    public enum ProductStatus {
        ACTIVE,
        INACTIVE
    }

    /**
     * Stock status enumeration
     */
    public enum StockStatus {
        IN_STOCK,
        LOW_STOCK,
        OUT_OF_STOCK
    }
}