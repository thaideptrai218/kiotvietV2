package fa.academy.kiotviet.application.dto.dashboard.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatisticsDto {
    // Overview Statistics
    private Long totalProducts;
    private Long totalOrders;
    private Long totalCustomers;
    private Long totalSuppliers;
    private Long inventoryItems;

    // Revenue Data by Periods
    private RevenueStatisticsDto todayRevenue;
    private RevenueStatisticsDto thisWeekRevenue;
    private RevenueStatisticsDto thisMonthRevenue;
    private RevenueStatisticsDto thisQuarterRevenue;
    private RevenueStatisticsDto thisYearRevenue;

    // Top Performers
    private List<TopProductDto> topProducts;
    private List<TopCategoryDto> topCategories;
    private List<TopCustomerDto> topCustomers;

    // Payment Method Distribution
    private List<PaymentMethodDto> paymentMethodStats;

    // Quick Stats
    private Long lowStockCount;
    private Long outOfStockCount;
    private BigDecimal totalInventoryValue;

    // Period-over-period comparisons
    private BigDecimal dailyGrowth;
    private BigDecimal weeklyGrowth;
    private BigDecimal monthlyGrowth;

    // Timestamp
    private LocalDateTime lastUpdated;
}