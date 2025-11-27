package fa.academy.kiotviet.application.dto.dashboard.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopCategoryDto {
    private Long categoryId;
    private String categoryName;
    private String categoryPath;
    private Long productCount;
    private Long totalSold;
    private BigDecimal totalRevenue;
    private Double percentageOfTotalRevenue;
}