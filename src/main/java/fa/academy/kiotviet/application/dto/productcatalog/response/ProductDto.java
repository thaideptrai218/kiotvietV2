package fa.academy.kiotviet.application.dto.productcatalog.response;

import fa.academy.kiotviet.core.productcatalog.domain.Product;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Response DTO for Product entities.
 * Contains product information with calculated fields for API responses.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDto {

    private Long id;
    private String sku;
    private String name;
    private String barcode;
    private String description;
    private BigDecimal sellingPrice;
    private BigDecimal costPrice;
    private BigDecimal profitAmount;
    private BigDecimal profitMargin;
    private Integer onHand;
    private Integer minLevel;
    private Integer maxLevel;
    private Product.ProductStatus status;
    private Boolean isTracked;
    private String stockStatus;
    private Boolean needsReorder;
    private Integer reorderQuantity;
    private Boolean isAvailable;
    private CategoryDto category;
    private SupplierDto supplier;
    private BrandDto brand;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    /**
     * Nested DTO for category information
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryDto {
        private Long id;
        private String name;
        private String path;
        private String fullPathName;
    }

    /**
     * Nested DTO for supplier information
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SupplierDto {
        private Long id;
        private String name;
        private String contactPerson;
        private String phone;
        private String email;
        private Boolean isActive;
    }

    /**
     * Nested DTO for brand information
     */
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BrandDto {
        private Long id;
        private String name;
        private String description;
        private String website;
        private String logoUrl;
        private Boolean isActive;
    }
}