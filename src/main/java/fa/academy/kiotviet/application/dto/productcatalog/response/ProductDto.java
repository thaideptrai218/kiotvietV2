package fa.academy.kiotviet.application.dto.productcatalog.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProductDto {
    private Long id;
    private String barcode;
    private String sku;
    private String name;
    private String description;
    private CategorySummaryDto category;
    private SupplierSummaryDto supplier;
    private BigDecimal price;
    private BigDecimal costPrice;
    private Boolean taxable;
    private Integer stock;
    private Integer minStock;
    private Integer maxStock;
    private String unit;
    private String brand;
    private String tags;
    private String status;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Computed fields
    private Boolean lowStock;
    private Boolean outOfStock;
    private BigDecimal profitMargin;
    private String formattedPrice;
    private String formattedCostPrice;
    private String displayName;

    // Nested DTOs for category and supplier summaries
    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class CategorySummaryDto {
        private Long id;
        private String name;
        private String path;
        private String fullPathName;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class SupplierSummaryDto {
        private Long id;
        private String name;
        private String contactPerson;
    }
}