package fa.academy.kiotviet.core.systemadmin.application;

import fa.academy.kiotviet.core.systemadmin.dto.SystemAdminDashboardMetricsDTO;
import fa.academy.kiotviet.core.tenant.repository.CompanyRepository;
import fa.academy.kiotviet.core.usermanagement.repository.UserInfoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

/**
 * Service for system admin dashboard metrics
 * Provides aggregate statistics across all tenants
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SystemAdminDashboardService {

    private final CompanyRepository companyRepository;
    private final UserInfoRepository userInfoRepository;

    /**
     * Get system-wide dashboard metrics
     */
    @Transactional(readOnly = true)
    public SystemAdminDashboardMetricsDTO getDashboardMetrics() {
        log.info("System Admin: Fetching dashboard metrics");

        // Company metrics
        long totalCompanies = companyRepository.count();
        long activeCompanies = companyRepository.findAll().stream()
                .filter(company -> company.getIsActive() != null && company.getIsActive())
                .count();
        long suspendedCompanies = totalCompanies - activeCompanies;

        // User metrics
        long totalUsers = userInfoRepository.count();
        long activeUsers = userInfoRepository.findAll().stream()
                .filter(user -> user.getIsActive() != null && user.getIsActive())
                .count();
        long inactiveUsers = totalUsers - activeUsers;

        // Order and product metrics (placeholders - to be implemented)
        long totalOrders = 0L; // TODO: Implement when Order repository is available
        BigDecimal totalRevenue = BigDecimal.ZERO; // TODO: Implement when Order repository is available
        long totalProducts = 0L; // TODO: Implement when Product repository is available

        return SystemAdminDashboardMetricsDTO.builder()
                .totalCompanies(totalCompanies)
                .activeCompanies(activeCompanies)
                .suspendedCompanies(suspendedCompanies)
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .inactiveUsers(inactiveUsers)
                .totalOrders(totalOrders)
                .totalRevenue(totalRevenue)
                .totalProducts(totalProducts)
                .build();
    }
}
