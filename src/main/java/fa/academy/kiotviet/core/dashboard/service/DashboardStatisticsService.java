package fa.academy.kiotviet.core.dashboard.service;

import fa.academy.kiotviet.application.dto.dashboard.response.*;
import fa.academy.kiotviet.core.orders.domain.Order;
import fa.academy.kiotviet.core.orders.repository.OrderItemRepository;
import fa.academy.kiotviet.core.orders.repository.OrderRepository;
import fa.academy.kiotviet.core.productcatalog.domain.Product;
import fa.academy.kiotviet.core.productcatalog.repository.ProductRepository;
import fa.academy.kiotviet.core.suppliers.domain.Supplier;
import fa.academy.kiotviet.core.suppliers.repository.SupplierRepository;
import fa.academy.kiotviet.core.tenant.domain.Company;
import fa.academy.kiotviet.core.usermanagement.domain.UserInfo;
import fa.academy.kiotviet.core.usermanagement.repository.UserInfoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardStatisticsService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final ProductRepository productRepository;
    private final SupplierRepository supplierRepository;
    private final UserInfoRepository userInfoRepository;

    public DashboardStatisticsDto getDashboardStatistics(Long companyId) {
        try {
            LocalDateTime now = LocalDateTime.now();

            // Basic counts
            Long totalProducts = productRepository.countByCompanyId(companyId);
            Long totalOrders = orderRepository.countByCompanyId(companyId);
            Long totalCustomers = userInfoRepository.countActiveCustomersByCompanyId(companyId);
            Long totalSuppliers = supplierRepository.countByCompanyId(companyId);
            Long inventoryItems = productRepository.countByCompanyIdAndIsTrackedTrue(companyId);

            // Revenue statistics for different periods
            RevenueStatisticsDto todayRevenue = getRevenueStatistics(companyId, now.toLocalDate(), now.toLocalDate(),
                    "Today");
            RevenueStatisticsDto thisWeekRevenue = getRevenueStatistics(companyId,
                    now.toLocalDate().with(DayOfWeek.MONDAY), now.toLocalDate(), "This Week");
            RevenueStatisticsDto thisMonthRevenue = getRevenueStatistics(companyId,
                    now.toLocalDate().withDayOfMonth(1), now.toLocalDate(), "This Month");
            RevenueStatisticsDto thisQuarterRevenue = getQuarterRevenueStatistics(companyId, now, "This Quarter");
            RevenueStatisticsDto thisYearRevenue = getRevenueStatistics(companyId,
                    now.toLocalDate().withDayOfYear(1), now.toLocalDate(), "This Year");

            // Top performers
            List<TopProductDto> topProducts = getTopProducts(companyId, 5);
            List<TopCategoryDto> topCategories = getTopCategories(companyId, 5);
            List<TopCustomerDto> topCustomers = getTopCustomers(companyId, 5);

            // Payment method distribution
            List<PaymentMethodDto> paymentMethodStats = getPaymentMethodStatistics(companyId);

            // Inventory alerts
            Long lowStockCount = productRepository.countLowStockProducts(companyId);
            Long outOfStockCount = productRepository.countOutOfStockProducts(companyId);
            BigDecimal totalInventoryValue = productRepository.getTotalInventoryValue(companyId);

            // Growth calculations
            BigDecimal dailyGrowth = calculateGrowthRate(todayRevenue.getTotalRevenue(),
                    getRevenueForPreviousPeriod(companyId, now.toLocalDate().minusDays(1),
                            now.toLocalDate().minusDays(1)));
            BigDecimal weeklyGrowth = calculateGrowthRate(thisWeekRevenue.getTotalRevenue(),
                    getRevenueForPreviousPeriod(companyId,
                            now.toLocalDate().minusWeeks(1).with(DayOfWeek.MONDAY),
                            now.toLocalDate().minusWeeks(1).with(DayOfWeek.SUNDAY)));
            BigDecimal monthlyGrowth = calculateGrowthRate(thisMonthRevenue.getTotalRevenue(),
                    getRevenueForPreviousPeriod(companyId,
                            now.toLocalDate().minusMonths(1).withDayOfMonth(1),
                            now.toLocalDate().minusMonths(1)
                                    .withDayOfMonth(now.toLocalDate().minusMonths(1).lengthOfMonth())));

            return DashboardStatisticsDto.builder()
                    .totalProducts(totalProducts)
                    .totalOrders(totalOrders)
                    .totalCustomers(totalCustomers)
                    .totalSuppliers(totalSuppliers)
                    .inventoryItems(inventoryItems)
                    .todayRevenue(todayRevenue)
                    .thisWeekRevenue(thisWeekRevenue)
                    .thisMonthRevenue(thisMonthRevenue)
                    .thisQuarterRevenue(thisQuarterRevenue)
                    .thisYearRevenue(thisYearRevenue)
                    .topProducts(topProducts)
                    .topCategories(topCategories)
                    .topCustomers(topCustomers)
                    .paymentMethodStats(paymentMethodStats)
                    .lowStockCount(lowStockCount)
                    .outOfStockCount(outOfStockCount)
                    .totalInventoryValue(totalInventoryValue)
                    .dailyGrowth(dailyGrowth)
                    .weeklyGrowth(weeklyGrowth)
                    .monthlyGrowth(monthlyGrowth)
                    .lastUpdated(LocalDateTime.now())
                    .build();

        } catch (Exception e) {
            log.error("Error generating dashboard statistics for company {}: {}", companyId, e.getMessage(), e);
            throw new RuntimeException("Failed to generate dashboard statistics", e);
        }
    }

    private RevenueStatisticsDto getRevenueStatistics(Long companyId, LocalDate startDate, LocalDate endDate,
            String periodLabel) {
        try {
            LocalDateTime startDateTime = startDate.atStartOfDay();
            LocalDateTime endDateTime = endDate.atTime(23, 59, 59);

            List<Order> orders = orderRepository.findByCompanyIdAndOrderDateBetween(companyId, startDateTime,
                    endDateTime);

            Long totalOrders = (long) orders.size();
            BigDecimal totalRevenue = orders.stream()
                    .filter(order -> order.getStatus() == Order.OrderStatus.COMPLETED)
                    .map(Order::getPaidAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal averageOrderValue = totalOrders > 0
                    ? totalRevenue.divide(BigDecimal.valueOf(totalOrders), 2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            // Previous period data for comparison
            LocalDate previousStart = startDate.minusDays(endDate.toEpochDay() - startDate.toEpochDay() + 1);
            LocalDate previousEnd = startDate.minusDays(1);
            BigDecimal previousPeriodRevenue = getRevenueForPreviousPeriod(companyId, previousStart, previousEnd);

            // Growth calculation
            BigDecimal growthRate = calculateGrowthRate(totalRevenue, previousPeriodRevenue);

            // Additional metrics
            Long uniqueCustomers = orders.stream()
                    .filter(order -> order.getStatus() == Order.OrderStatus.COMPLETED)
                    .map(Order::getPhoneNumber)
                    .filter(Objects::nonNull)
                    .distinct()
                    .count();

            Long totalItemsSold = orderItemRepository.getTotalItemsSoldByCompanyIdAndDateRange(
                    companyId, startDateTime, endDateTime);

            // Calculate profit (assuming 20% average margin - this should be calculated
            // based on actual cost data)
            BigDecimal totalProfit = totalRevenue.multiply(BigDecimal.valueOf(0.20));

            return RevenueStatisticsDto.builder()
                    .totalOrders(totalOrders)
                    .totalRevenue(totalRevenue)
                    .averageOrderValue(averageOrderValue)
                    .previousPeriodRevenue(previousPeriodRevenue)
                    .growthRate(growthRate)
                    .startDate(startDate)
                    .endDate(endDate)
                    .periodLabel(periodLabel)
                    .hasGrowth(growthRate.compareTo(BigDecimal.ZERO) > 0)
                    .growthPercentage(growthRate.compareTo(BigDecimal.ZERO) >= 0
                            ? "+" + growthRate.setScale(2, RoundingMode.HALF_UP) + "%"
                            : growthRate.setScale(2, RoundingMode.HALF_UP) + "%")
                    .uniqueCustomers(uniqueCustomers)
                    .totalItemsSold(totalItemsSold)
                    .totalProfit(totalProfit)
                    .lastUpdated(LocalDateTime.now())
                    .build();

        } catch (Exception e) {
            log.error("Error calculating revenue statistics for period {} to {}: {}", startDate, endDate,
                    e.getMessage(), e);
            return createEmptyRevenueStatistics(startDate, endDate, periodLabel);
        }
    }

    private RevenueStatisticsDto getQuarterRevenueStatistics(Long companyId, LocalDateTime now, String periodLabel) {
        YearMonth currentYearMonth = YearMonth.from(now);
        int currentQuarter = (currentYearMonth.getMonthValue() - 1) / 3 + 1;

        LocalDate quarterStart = LocalDate.of(now.getYear(), (currentQuarter - 1) * 3 + 1, 1);
        LocalDate quarterEnd = LocalDate.of(now.getYear(), currentQuarter * 3, 1)
                .withDayOfMonth(1)
                .minusDays(1);

        return getRevenueStatistics(companyId, quarterStart, quarterEnd, periodLabel);
    }

    private BigDecimal getRevenueForPreviousPeriod(Long companyId, LocalDate startDate, LocalDate endDate) {
        try {
            LocalDateTime startDateTime = startDate.atStartOfDay();
            LocalDateTime endDateTime = endDate.atTime(23, 59, 59);

            return orderRepository.findByCompanyIdAndOrderDateBetween(companyId, startDateTime, endDateTime)
                    .stream()
                    .filter(order -> order.getStatus() == Order.OrderStatus.COMPLETED)
                    .map(Order::getPaidAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
        } catch (Exception e) {
            log.error("Error calculating previous period revenue for period {} to {}: {}", startDate, endDate,
                    e.getMessage(), e);
            return BigDecimal.ZERO;
        }
    }

    private BigDecimal calculateGrowthRate(BigDecimal current, BigDecimal previous) {
        if (previous == null || previous.compareTo(BigDecimal.ZERO) == 0) {
            return BigDecimal.ZERO;
        }
        return current.subtract(previous)
                .divide(previous, 4, RoundingMode.HALF_UP)
                .multiply(BigDecimal.valueOf(100));
    }

    private RevenueStatisticsDto createEmptyRevenueStatistics(LocalDate startDate, LocalDate endDate,
            String periodLabel) {
        return RevenueStatisticsDto.builder()
                .totalOrders(0L)
                .totalRevenue(BigDecimal.ZERO)
                .averageOrderValue(BigDecimal.ZERO)
                .previousPeriodRevenue(BigDecimal.ZERO)
                .growthRate(BigDecimal.ZERO)
                .startDate(startDate)
                .endDate(endDate)
                .periodLabel(periodLabel)
                .hasGrowth(false)
                .growthPercentage("0%")
                .uniqueCustomers(0L)
                .totalItemsSold(0L)
                .totalProfit(BigDecimal.ZERO)
                .lastUpdated(LocalDateTime.now())
                .build();
    }

    private List<TopProductDto> getTopProducts(Long companyId, int limit) {
        try {
            Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "totalRevenue"));
            List<Object[]> results = orderItemRepository.getTopProductsByCompanyId(companyId, pageable);

            return results.stream()
                    .map(result -> {
                        Product product = (Product) result[0];
                        Long totalSold = ((Number) result[1]).longValue();
                        BigDecimal totalRevenue = (BigDecimal) result[2];

                        return TopProductDto.builder()
                                .productId(product.getId())
                                .productName(product.getName())
                                .sku(product.getSku())
                                .barcode(product.getBarcode())
                                .sellingPrice(product.getSellingPrice())
                                .totalSold(totalSold)
                                .totalRevenue(totalRevenue)
                                .categoryName(product.getCategory() != null ? product.getCategory().getName() : "N/A")
                                .brandName(product.getBrand() != null ? product.getBrand().getName() : "N/A")
                                .build();
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error getting top products: {}", e.getMessage(), e);
            return Collections.emptyList();
        }
    }

    private List<TopCategoryDto> getTopCategories(Long companyId, int limit) {
        try {
            Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "totalRevenue"));
            List<Object[]> results = orderItemRepository.getTopCategoriesByCompanyId(companyId, pageable);

            BigDecimal totalRevenue = results.stream()
                    .map(result -> (BigDecimal) result[3])
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            return results.stream()
                    .map(result -> {
                        String categoryName = (String) result[0];
                        Long productCount = ((Number) result[1]).longValue();
                        Long totalSold = ((Number) result[2]).longValue();
                        BigDecimal categoryRevenue = (BigDecimal) result[3];

                        Double percentageOfTotal = totalRevenue.compareTo(BigDecimal.ZERO) > 0
                                ? categoryRevenue.divide(totalRevenue, 4, RoundingMode.HALF_UP)
                                        .multiply(BigDecimal.valueOf(100)).doubleValue()
                                : 0.0;

                        return TopCategoryDto.builder()
                                .categoryId(null) // We don't have category ID from the query
                                .categoryName(categoryName)
                                .categoryPath(categoryName)
                                .productCount(productCount)
                                .totalSold(totalSold)
                                .totalRevenue(categoryRevenue)
                                .percentageOfTotalRevenue(percentageOfTotal)
                                .build();
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error getting top categories: {}", e.getMessage(), e);
            return Collections.emptyList();
        }
    }

    private List<TopCustomerDto> getTopCustomers(Long companyId, int limit) {
        try {
            Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "totalSpent"));
            List<Object[]> results = orderRepository.getTopCustomersByCompanyId(companyId, pageable);

            return results.stream()
                    .map(result -> {
                        String customerName = (String) result[0];
                        String phoneNumber = (String) result[1];
                        Long orderCount = ((Number) result[2]).longValue();
                        BigDecimal totalSpent = (BigDecimal) result[3];
                        LocalDate lastOrderDate = ((java.sql.Date) result[4]).toLocalDate();

                        BigDecimal averageOrderValue = orderCount > 0
                                ? totalSpent.divide(BigDecimal.valueOf(orderCount), 2, RoundingMode.HALF_UP)
                                : BigDecimal.ZERO;

                        return TopCustomerDto.builder()
                                .customerName(customerName)
                                .phoneNumber(phoneNumber)
                                .orderCount(orderCount)
                                .totalSpent(totalSpent)
                                .averageOrderValue(averageOrderValue)
                                .lastOrderDate(lastOrderDate)
                                .customerId(null) // Customer ID not available from current query
                                .build();
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error getting top customers: {}", e.getMessage(), e);
            return Collections.emptyList();
        }
    }

    private List<PaymentMethodDto> getPaymentMethodStatistics(Long companyId) {
        try {
            List<Object[]> results = orderRepository.getPaymentMethodStatisticsByCompanyId(companyId);

            BigDecimal totalRevenue = results.stream()
                    .map(result -> (BigDecimal) result[2])
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            return results.stream()
                    .map(result -> {
                        Order.PaymentMethod paymentMethod = (Order.PaymentMethod) result[0];
                        Long transactionCount = ((Number) result[1]).longValue();
                        BigDecimal amount = (BigDecimal) result[2];

                        Double percentageOfTotal = totalRevenue.compareTo(BigDecimal.ZERO) > 0
                                ? amount.divide(totalRevenue, 4, RoundingMode.HALF_UP)
                                        .multiply(BigDecimal.valueOf(100)).doubleValue()
                                : 0.0;

                        BigDecimal averageTransactionValue = transactionCount > 0
                                ? amount.divide(BigDecimal.valueOf(transactionCount), 2, RoundingMode.HALF_UP)
                                : BigDecimal.ZERO;

                        return PaymentMethodDto.builder()
                                .paymentMethod(paymentMethod)
                                .paymentMethodLabel(formatPaymentMethodLabel(paymentMethod))
                                .transactionCount(transactionCount)
                                .totalAmount(amount)
                                .percentageOfTotal(percentageOfTotal)
                                .averageTransactionValue(averageTransactionValue)
                                .build();
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error getting payment method statistics: {}", e.getMessage(), e);
            return Collections.emptyList();
        }
    }

    private String formatPaymentMethodLabel(Order.PaymentMethod paymentMethod) {
        if (paymentMethod == null)
            return "Unknown";
        return paymentMethod.name().charAt(0) + paymentMethod.name().substring(1).toLowerCase();
    }

    // Additional methods for new API endpoints
    public List<TopProductDto> getTopProducts(Long companyId, int limit, String period) {
        try {
            LocalDate[] dateRange = getDateRangeForPeriod(period);
            LocalDateTime startDateTime = dateRange[0].atStartOfDay();
            LocalDateTime endDateTime = dateRange[1].atTime(23, 59, 59);

            Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "totalRevenue"));
            List<Object[]> results = orderItemRepository.getTopProductsByCompanyIdAndDateRange(companyId, startDateTime,
                    endDateTime, pageable);

            return results.stream()
                    .map(result -> {
                        Product product = (Product) result[0];
                        Long totalSold = ((Number) result[1]).longValue();
                        BigDecimal totalRevenue = (BigDecimal) result[2];

                        return TopProductDto.builder()
                                .productId(product.getId())
                                .productName(product.getName())
                                .sku(product.getSku())
                                .barcode(product.getBarcode())
                                .sellingPrice(product.getSellingPrice())
                                .totalSold(totalSold)
                                .totalRevenue(totalRevenue)
                                .lastSaleDate(null) // Not available from current query
                                .categoryName(product.getCategory() != null ? product.getCategory().getName() : "N/A")
                                .brandName(product.getBrand() != null ? product.getBrand().getName() : "N/A")
                                .build();
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error getting top products for period {}: {}", period, e.getMessage(), e);
            return Collections.emptyList();
        }
    }

    public List<TopCategoryDto> getTopCategories(Long companyId, int limit, String period) {
        try {
            LocalDate[] dateRange = getDateRangeForPeriod(period);
            LocalDateTime startDateTime = dateRange[0].atStartOfDay();
            LocalDateTime endDateTime = dateRange[1].atTime(23, 59, 59);

            Pageable pageable = PageRequest.of(0, limit, Sort.by(Sort.Direction.DESC, "totalRevenue"));
            List<Object[]> results = orderItemRepository.getTopCategoriesByCompanyIdAndDateRange(companyId,
                    startDateTime, endDateTime, pageable);

            BigDecimal totalRevenue = results.stream()
                    .map(result -> (BigDecimal) result[3])
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            return results.stream()
                    .map(result -> {
                        String categoryName = (String) result[0];
                        Long productCount = ((Number) result[1]).longValue();
                        Long totalSold = ((Number) result[2]).longValue();
                        BigDecimal categoryRevenue = (BigDecimal) result[3];

                        Double percentageOfTotal = totalRevenue.compareTo(BigDecimal.ZERO) > 0
                                ? categoryRevenue.divide(totalRevenue, 4, RoundingMode.HALF_UP)
                                        .multiply(BigDecimal.valueOf(100)).doubleValue()
                                : 0.0;

                        return TopCategoryDto.builder()
                                .categoryId(null) // We don't have category ID from query
                                .categoryName(categoryName)
                                .categoryPath(categoryName)
                                .productCount(productCount)
                                .totalSold(totalSold)
                                .totalRevenue(categoryRevenue)
                                .percentageOfTotalRevenue(percentageOfTotal)
                                .build();
                    })
                    .collect(Collectors.toList());
        } catch (Exception e) {
            log.error("Error getting top categories for period {}: {}", period, e.getMessage(), e);
            return Collections.emptyList();
        }
    }

    public RevenueStatisticsDto getRevenueSummary(Long companyId, String period, LocalDate startDate,
            LocalDate endDate) {
        try {
            LocalDate[] dateRange = getDateRangeForPeriod(period, startDate, endDate);
            return getRevenueStatistics(companyId, dateRange[0], dateRange[1], getPeriodLabel(period));
        } catch (Exception e) {
            log.error("Error getting revenue summary for period {}: {}", period, e.getMessage(), e);
            return createEmptyRevenueStatistics(LocalDate.now(), LocalDate.now(), getPeriodLabel(period));
        }
    }

    public Map<String, Object> getInventoryStatus(Long companyId) {
        try {
            Long lowStockCount = productRepository.countLowStockProducts(companyId);
            Long outOfStockCount = productRepository.countOutOfStockProducts(companyId);
            BigDecimal totalInventoryValue = productRepository.getTotalInventoryValue(companyId);
            Long totalProducts = productRepository.countByCompanyId(companyId);
            Long trackedProducts = productRepository.countByCompanyIdAndIsTrackedTrue(companyId);

            Map<String, Object> inventoryStatus = new HashMap<>();
            inventoryStatus.put("totalProducts", totalProducts);
            inventoryStatus.put("trackedProducts", trackedProducts);
            inventoryStatus.put("lowStockCount", lowStockCount);
            inventoryStatus.put("outOfStockCount", outOfStockCount);
            inventoryStatus.put("totalInventoryValue", totalInventoryValue);
            inventoryStatus.put("lastUpdated", LocalDateTime.now());

            return inventoryStatus;
        } catch (Exception e) {
            log.error("Error getting inventory status: {}", e.getMessage(), e);
            return new HashMap<>();
        }
    }

    public Map<String, BigDecimal> getGrowthMetrics(Long companyId) {
        try {
            LocalDateTime now = LocalDateTime.now();

            // Today's revenue
            BigDecimal todayRevenue = getRevenueForPreviousPeriod(companyId,
                    now.toLocalDate().minusDays(1), now.toLocalDate().minusDays(1));

            // Today's revenue (current)
            BigDecimal currentTodayRevenue = orderRepository.findByCompanyIdAndOrderDateBetween(companyId,
                    now.toLocalDate().atStartOfDay(), now.toLocalDate().atTime(23, 59, 59))
                    .stream()
                    .filter(order -> order.getStatus() == Order.OrderStatus.COMPLETED)
                    .map(Order::getPaidAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            // Weekly growth
            BigDecimal thisWeekRevenue = getRevenueForPreviousPeriod(companyId,
                    now.toLocalDate().minusWeeks(1).with(DayOfWeek.MONDAY),
                    now.toLocalDate().minusWeeks(1).with(DayOfWeek.SUNDAY));
            BigDecimal currentWeekRevenue = getRevenueForPreviousPeriod(companyId,
                    now.toLocalDate().with(DayOfWeek.MONDAY),
                    now.toLocalDate().with(DayOfWeek.SUNDAY));

            // Monthly growth
            BigDecimal thisMonthRevenue = getRevenueForPreviousPeriod(companyId,
                    now.toLocalDate().minusMonths(1).withDayOfMonth(1),
                    now.toLocalDate().minusMonths(1).withDayOfMonth(now.toLocalDate().minusMonths(1).lengthOfMonth()));
            BigDecimal currentMonthRevenue = getRevenueForPreviousPeriod(companyId,
                    now.toLocalDate().withDayOfMonth(1),
                    now.toLocalDate().minusDays(1));

            Map<String, BigDecimal> growthMetrics = new HashMap<>();
            growthMetrics.put("daily", calculateGrowthRate(currentTodayRevenue, todayRevenue));
            growthMetrics.put("weekly", calculateGrowthRate(currentWeekRevenue, thisWeekRevenue));
            growthMetrics.put("monthly", calculateGrowthRate(currentMonthRevenue, thisMonthRevenue));

            return growthMetrics;
        } catch (Exception e) {
            log.error("Error calculating growth metrics: {}", e.getMessage(), e);
            return new HashMap<>();
        }
    }

    private LocalDate[] getDateRangeForPeriod(String period) {
        return getDateRangeForPeriod(period, null, null);
    }

    private LocalDate[] getDateRangeForPeriod(String period, LocalDate customStart, LocalDate customEnd) {
        LocalDateTime now = LocalDateTime.now();

        if (customStart != null && customEnd != null) {
            return new LocalDate[] { customStart, customEnd };
        }

        switch (period.toLowerCase()) {
            case "today":
                return new LocalDate[] { now.toLocalDate(), now.toLocalDate() };
            case "thisweek":
                return new LocalDate[] { now.toLocalDate().with(DayOfWeek.MONDAY), now.toLocalDate() };
            case "thismonth":
                return new LocalDate[] { now.toLocalDate().withDayOfMonth(1), now.toLocalDate() };
            case "thisquarter":
                YearMonth currentYearMonth = YearMonth.from(now);
                int currentQuarter = (currentYearMonth.getMonthValue() - 1) / 3 + 1;
                return new LocalDate[] {
                        LocalDate.of(now.getYear(), (currentQuarter - 1) * 3 + 1, 1),
                        LocalDate.of(now.getYear(), currentQuarter * 3, 1).minusDays(1)
                };
            case "thisyear":
                return new LocalDate[] { LocalDate.of(now.getYear(), 1, 1), now.toLocalDate() };
            default:
                return new LocalDate[] { now.toLocalDate().withDayOfMonth(1), now.toLocalDate() };
        }
    }

    private String getPeriodLabel(String period) {
        switch (period.toLowerCase()) {
            case "today":
                return "Today";
            case "thisweek":
                return "This Week";
            case "thismonth":
                return "This Month";
            case "thisquarter":
                return "This Quarter";
            case "thisyear":
                return "This Year";
            default:
                return "Custom Period";
        }
    }
}