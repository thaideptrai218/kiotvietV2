package fa.academy.kiotviet.core.systemadmin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO for system admin dashboard metrics
 * Contains aggregate statistics across all tenants
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemAdminDashboardMetricsDTO {

    private Long totalCompanies;
    private Long activeCompanies;
    private Long suspendedCompanies;
    private Long totalUsers;
    private Long activeUsers;
    private Long inactiveUsers;
    private Long totalOrders;
    private BigDecimal totalRevenue;
    private Long totalProducts;
}
