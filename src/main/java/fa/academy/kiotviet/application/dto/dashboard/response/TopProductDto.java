package fa.academy.kiotviet.application.dto.dashboard.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopProductDto {
    private Long productId;
    private String productName;
    private String sku;
    private String barcode;
    private BigDecimal sellingPrice;
    private Long totalSold;
    private BigDecimal totalRevenue;
    private LocalDate lastSaleDate;
    private String categoryName;
    private String brandName;
}