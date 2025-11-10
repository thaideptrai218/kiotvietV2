package fa.academy.kiotviet.application.dto.productcatalog.request;

import fa.academy.kiotviet.core.productcatalog.domain.Product;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ProductSearchRequest {
    private String query;                    // General search query
    private List<Long> categoryIds;          // Filter by categories
    private Long supplierId;                 // Filter by supplier
    private Product.ProductStatus status;    // Filter by status
    private BigDecimal minPrice;             // Minimum price filter
    private BigDecimal maxPrice;             // Maximum price filter
    private Integer minStock;                // Minimum stock filter
    private Integer maxStock;                // Maximum stock filter
    private String sortBy;                   // Sort field
    private String sortDir;                  // Sort direction
    private Integer page = 0;                // Page number (0-based)
    private Integer size = 20;               // Page size
}