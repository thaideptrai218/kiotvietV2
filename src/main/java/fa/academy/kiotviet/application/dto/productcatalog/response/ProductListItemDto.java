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
public class ProductListItemDto {
    private Long id;
    private String barcode;
    private String sku;
    private String name;
    private String categoryName;
    private String supplierName;
    private BigDecimal price;
    private Integer stock;
    private String status;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Computed fields for UI
    private Boolean lowStock;
    private Boolean outOfStock;
    private String formattedPrice;
    private String displayName;
}