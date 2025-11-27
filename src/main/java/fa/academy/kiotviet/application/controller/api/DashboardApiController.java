package fa.academy.kiotviet.application.controller.api;

import fa.academy.kiotviet.application.dto.dashboard.response.*;
import fa.academy.kiotviet.application.dto.shared.SuccessResponse;
import fa.academy.kiotviet.core.dashboard.service.DashboardStatisticsService;
import fa.academy.kiotviet.infrastructure.security.SecurityUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
@Slf4j
public class DashboardApiController {

    private final DashboardStatisticsService dashboardStatisticsService;

    @GetMapping("/statistics")
    public ResponseEntity<SuccessResponse<DashboardStatisticsDto>> getDashboardStatistics() {
        try {
            Long companyId = SecurityUtil.getCurrentCompanyId();
            DashboardStatisticsDto statistics = dashboardStatisticsService.getDashboardStatistics(companyId);

            return ResponseEntity.ok(SuccessResponse.of(statistics, "Dashboard statistics retrieved successfully"));
        } catch (Exception e) {
            log.error("Error retrieving dashboard statistics: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(SuccessResponse.of("Failed to retrieve dashboard statistics"));
        }
    }

    @GetMapping("/health")
    public ResponseEntity<SuccessResponse<String>> health() {
        return ResponseEntity.ok(SuccessResponse.of("Dashboard API is healthy"));
    }

    @GetMapping("/top-products")
    public ResponseEntity<SuccessResponse<List<TopProductDto>>> getTopProducts(
            @RequestParam(defaultValue = "5") int limit,
            @RequestParam(defaultValue = "thisMonth") String period) {
        try {
            Long companyId = SecurityUtil.getCurrentCompanyId();
            List<TopProductDto> topProducts = dashboardStatisticsService.getTopProducts(companyId, limit, period);

            return ResponseEntity.ok(SuccessResponse.of(topProducts, "Top products retrieved successfully"));
        } catch (Exception e) {
            log.error("Error retrieving top products: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(SuccessResponse.of("Failed to retrieve top products"));
        }
    }

    @GetMapping("/top-categories")
    public ResponseEntity<SuccessResponse<List<TopCategoryDto>>> getTopCategories(
            @RequestParam(defaultValue = "5") int limit,
            @RequestParam(defaultValue = "thisMonth") String period) {
        try {
            Long companyId = SecurityUtil.getCurrentCompanyId();
            List<TopCategoryDto> topCategories = dashboardStatisticsService.getTopCategories(companyId, limit, period);

            return ResponseEntity.ok(SuccessResponse.of(topCategories, "Top categories retrieved successfully"));
        } catch (Exception e) {
            log.error("Error retrieving top categories: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(SuccessResponse.of("Failed to retrieve top categories"));
        }
    }

    @GetMapping("/revenue-summary")
    public ResponseEntity<SuccessResponse<RevenueStatisticsDto>> getRevenueSummary(
            @RequestParam(defaultValue = "thisMonth") String period,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        try {
            Long companyId = SecurityUtil.getCurrentCompanyId();
            RevenueStatisticsDto revenueSummary = dashboardStatisticsService.getRevenueSummary(companyId, period,
                    startDate, endDate);

            return ResponseEntity.ok(SuccessResponse.of(revenueSummary, "Revenue summary retrieved successfully"));
        } catch (Exception e) {
            log.error("Error retrieving revenue summary: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(SuccessResponse.of("Failed to retrieve revenue summary"));
        }
    }

    @GetMapping("/inventory-status")
    public ResponseEntity<SuccessResponse<Map<String, Object>>> getInventoryStatus() {
        try {
            Long companyId = SecurityUtil.getCurrentCompanyId();
            Map<String, Object> inventoryStatus = dashboardStatisticsService.getInventoryStatus(companyId);

            return ResponseEntity.ok(SuccessResponse.of(inventoryStatus, "Inventory status retrieved successfully"));
        } catch (Exception e) {
            log.error("Error retrieving inventory status: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(SuccessResponse.of("Failed to retrieve inventory status"));
        }
    }

    @GetMapping("/growth-metrics")
    public ResponseEntity<SuccessResponse<Map<String, BigDecimal>>> getGrowthMetrics() {
        try {
            Long companyId = SecurityUtil.getCurrentCompanyId();
            Map<String, BigDecimal> growthMetrics = dashboardStatisticsService.getGrowthMetrics(companyId);

            return ResponseEntity.ok(SuccessResponse.of(growthMetrics, "Growth metrics retrieved successfully"));
        } catch (Exception e) {
            log.error("Error retrieving growth metrics: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                    .body(SuccessResponse.of("Failed to retrieve growth metrics"));
        }
    }
}