package fa.academy.kiotviet.application.dto.dashboard.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RevenueStatisticsDto {
    private Long totalOrders;
    private BigDecimal totalRevenue;
    private BigDecimal averageOrderValue;
    private BigDecimal previousPeriodRevenue;
    private BigDecimal growthRate;
    private LocalDate startDate;
    private LocalDate endDate;
    private String periodLabel;

    // Growth indicators
    private boolean hasGrowth;
    private String growthPercentage;

    // Additional metrics
    private Long uniqueCustomers;
    private Long totalItemsSold;
    private BigDecimal totalProfit;

    // Timestamps
    private LocalDateTime lastUpdated;
}