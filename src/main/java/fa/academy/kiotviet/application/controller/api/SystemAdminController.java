package fa.academy.kiotviet.application.controller.api;

import fa.academy.kiotviet.application.dto.shared.SuccessResponse;
import fa.academy.kiotviet.application.service.ResponseFactory;
import fa.academy.kiotviet.core.systemadmin.application.SystemAdminCompanyManagementService;
import fa.academy.kiotviet.core.systemadmin.application.SystemAdminDashboardService;
import fa.academy.kiotviet.core.systemadmin.application.SystemAdminUserManagementService;
import fa.academy.kiotviet.core.systemadmin.dto.SystemAdminCompanyCreateDTO;
import fa.academy.kiotviet.core.systemadmin.dto.SystemAdminCompanyDetailsDTO;
import fa.academy.kiotviet.core.systemadmin.dto.SystemAdminCompanyListDTO;
import fa.academy.kiotviet.core.systemadmin.dto.SystemAdminCompanyUpdateDTO;
import fa.academy.kiotviet.core.systemadmin.dto.SystemAdminDashboardMetricsDTO;
import fa.academy.kiotviet.core.systemadmin.dto.SystemAdminUserCreateDTO;
import fa.academy.kiotviet.core.systemadmin.dto.SystemAdminUserListDTO;
import fa.academy.kiotviet.core.systemadmin.dto.SystemAdminUserUpdateDTO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST API controller for system admin operations
 * All endpoints require system_admin role and bypass tenant filtering
 */
@RestController
@RequestMapping("/admin/api")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*", maxAge = 3600)
public class SystemAdminController {

    private final SystemAdminCompanyManagementService companyManagementService;
    private final SystemAdminUserManagementService userManagementService;
    private final SystemAdminDashboardService dashboardService;

    // ==================== Dashboard Endpoints ====================

    /**
     * Get system-wide dashboard metrics
     * GET /admin/api/dashboard
     */
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<SuccessResponse<SystemAdminDashboardMetricsDTO>> getDashboardMetrics() {
        log.info("System Admin API: Fetching dashboard metrics");

        SystemAdminDashboardMetricsDTO metrics = dashboardService.getDashboardMetrics();

        return ResponseEntity.ok(
                ResponseFactory.success(metrics, "Dashboard metrics retrieved successfully")
        );
    }

    // ==================== Company Management Endpoints ====================

    /**
     * Get all companies with pagination
     * GET /admin/api/companies
     */
    @GetMapping("/companies")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<SuccessResponse<Page<SystemAdminCompanyListDTO>>> getAllCompanies(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword) {

        log.info("System Admin API: Fetching all companies - page: {}, size: {}, status: {}, keyword: {}", page, size, status, keyword);

        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<SystemAdminCompanyListDTO> companies = companyManagementService.getAllCompanies(pageable, status, keyword);

        return ResponseEntity.ok(
                ResponseFactory.success(companies, "Companies retrieved successfully")
        );
    }

    /**
     * Get detailed information about a specific company
     * GET /admin/api/companies/{id}
     */
    @GetMapping("/companies/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<SuccessResponse<SystemAdminCompanyDetailsDTO>> getCompanyDetails(@PathVariable Long id) {
        log.info("System Admin API: Fetching company details for ID: {}", id);

        SystemAdminCompanyDetailsDTO company = companyManagementService.getCompanyDetails(id);

        return ResponseEntity.ok(
                ResponseFactory.success(company, "Company details retrieved successfully")
        );
    }

    /**
     * Create a new company
     * POST /admin/api/companies
     */
    @PostMapping("/companies")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<SuccessResponse<SystemAdminCompanyDetailsDTO>> createCompany(
            @Valid @RequestBody SystemAdminCompanyCreateDTO dto) {

        log.info("System Admin API: Creating new company - name: {}", dto.getName());

        SystemAdminCompanyDetailsDTO company = companyManagementService.createCompany(dto);

        return ResponseEntity.ok(
                ResponseFactory.success(company, "Company created successfully")
        );
    }

    /**
     * Update company information
     * PUT /admin/api/companies/{id}
     */
    @PutMapping("/companies/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<SuccessResponse<SystemAdminCompanyDetailsDTO>> updateCompany(
            @PathVariable Long id,
            @Valid @RequestBody SystemAdminCompanyUpdateDTO dto) {

        log.info("System Admin API: Updating company ID: {}", id);

        SystemAdminCompanyDetailsDTO company = companyManagementService.updateCompany(id, dto);

        return ResponseEntity.ok(
                ResponseFactory.success(company, "Company updated successfully")
        );
    }

    /**
     * Suspend a company (block all users from logging in)
     * POST /admin/api/companies/{id}/suspend
     */
    @PostMapping("/companies/{id}/suspend")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<SuccessResponse<Void>> suspendCompany(@PathVariable Long id) {
        log.info("System Admin API: Suspending company ID: {}", id);

        companyManagementService.suspendCompany(id);

        return ResponseEntity.ok(
                ResponseFactory.success(null, "Company suspended successfully")
        );
    }

    /**
     * Activate a company (allow users to log in again)
     * POST /admin/api/companies/{id}/activate
     */
    @PostMapping("/companies/{id}/activate")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<SuccessResponse<Void>> activateCompany(@PathVariable Long id) {
        log.info("System Admin API: Activating company ID: {}", id);

        companyManagementService.activateCompany(id);

        return ResponseEntity.ok(
                ResponseFactory.success(null, "Company activated successfully")
        );
    }

    /**
     * Delete a company (cascade delete all related data)
     * DELETE /admin/api/companies/{id}
     */
    @DeleteMapping("/companies/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<SuccessResponse<Void>> deleteCompany(@PathVariable Long id) {
        log.info("System Admin API: Deleting company ID: {}", id);

        companyManagementService.deleteCompany(id);

        return ResponseEntity.ok(
                ResponseFactory.success(null, "Company deleted successfully")
        );
    }

    /**
     * Search companies by name or email
     * GET /admin/api/companies/search
     */
    @GetMapping("/companies/search")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<SuccessResponse<List<SystemAdminCompanyListDTO>>> searchCompanies(
            @RequestParam String keyword) {

        log.info("System Admin API: Searching companies with keyword: {}", keyword);

        List<SystemAdminCompanyListDTO> companies = companyManagementService.searchCompanies(keyword);

        return ResponseEntity.ok(
                ResponseFactory.success(companies, "Companies searched successfully")
        );
    }

    // ==================== User Management Endpoints ====================

    /**
     * Get all users with pagination (cross-tenant query)
     * GET /admin/api/users
     */
    @GetMapping("/users")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<SuccessResponse<Page<SystemAdminUserListDTO>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Long companyId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword) {

        log.info("System Admin API: Fetching all users - page: {}, size: {}, role: {}, companyId: {}, status: {}, keyword: {}",
                page, size, role, companyId, status, keyword);

        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<SystemAdminUserListDTO> users = userManagementService.getAllUsers(pageable, role, companyId, status, keyword);

        return ResponseEntity.ok(
                ResponseFactory.success(users, "Users retrieved successfully")
        );
    }

    /**
     * Get users by company ID
     * GET /admin/api/companies/{companyId}/users
     */
    @GetMapping("/companies/{companyId}/users")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<SuccessResponse<Page<SystemAdminUserListDTO>>> getUsersByCompany(
            @PathVariable Long companyId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        log.info("System Admin API: Fetching users for company ID: {}", companyId);

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<SystemAdminUserListDTO> users = userManagementService.getUsersByCompany(companyId, pageable);

        return ResponseEntity.ok(
                ResponseFactory.success(users, "Users retrieved successfully")
        );
    }

    /**
     * Get detailed information about a specific user
     * GET /admin/api/users/{id}
     */
    @GetMapping("/users/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<SuccessResponse<SystemAdminUserListDTO>> getUserDetails(@PathVariable Long id) {
        log.info("System Admin API: Fetching user details for ID: {}", id);

        SystemAdminUserListDTO user = userManagementService.getUserDetails(id);

        return ResponseEntity.ok(
                ResponseFactory.success(user, "User details retrieved successfully")
        );
    }

    /**
     * Create a new user
     * POST /admin/api/users
     */
    @PostMapping("/users")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<SuccessResponse<SystemAdminUserListDTO>> createUser(
            @Valid @RequestBody SystemAdminUserCreateDTO dto) {

        log.info("System Admin API: Creating new user - username: {}", dto.getUsername());

        SystemAdminUserListDTO user = userManagementService.createUser(dto);

        return ResponseEntity.ok(
                ResponseFactory.success(user, "User created successfully")
        );
    }

    /**
     * Update user information
     * PUT /admin/api/users/{id}
     */
    @PutMapping("/users/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<SuccessResponse<SystemAdminUserListDTO>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody SystemAdminUserUpdateDTO dto) {

        log.info("System Admin API: Updating user ID: {}", id);

        SystemAdminUserListDTO user = userManagementService.updateUser(id, dto);

        return ResponseEntity.ok(
                ResponseFactory.success(user, "User updated successfully")
        );
    }

    /**
     * Activate a user
     * POST /admin/api/users/{id}/activate
     */
    @PostMapping("/users/{id}/activate")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<SuccessResponse<Void>> activateUser(@PathVariable Long id) {
        log.info("System Admin API: Activating user ID: {}", id);

        userManagementService.activateUser(id);

        return ResponseEntity.ok(
                ResponseFactory.success(null, "User activated successfully")
        );
    }

    /**
     * Deactivate a user
     * POST /admin/api/users/{id}/deactivate
     */
    @PostMapping("/users/{id}/deactivate")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<SuccessResponse<Void>> deactivateUser(@PathVariable Long id) {
        log.info("System Admin API: Deactivating user ID: {}", id);

        userManagementService.deactivateUser(id);

        return ResponseEntity.ok(
                ResponseFactory.success(null, "User deactivated successfully")
        );
    }

    /**
     * Delete a user
     * DELETE /admin/api/users/{id}
     */
    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<SuccessResponse<Void>> deleteUser(@PathVariable Long id) {
        log.info("System Admin API: Deleting user ID: {}", id);

        userManagementService.deleteUser(id);

        return ResponseEntity.ok(
                ResponseFactory.success(null, "User deleted successfully")
        );
    }

    /**
     * Search users by username, email, or name
     * GET /admin/api/users/search
     */
    @GetMapping("/users/search")
    @PreAuthorize("hasRole('SYSTEM_ADMIN')")
    public ResponseEntity<SuccessResponse<List<SystemAdminUserListDTO>>> searchUsers(
            @RequestParam String keyword) {

        log.info("System Admin API: Searching users with keyword: {}", keyword);

        List<SystemAdminUserListDTO> users = userManagementService.searchUsers(keyword);

        return ResponseEntity.ok(
                ResponseFactory.success(users, "Users searched successfully")
        );
    }
}
