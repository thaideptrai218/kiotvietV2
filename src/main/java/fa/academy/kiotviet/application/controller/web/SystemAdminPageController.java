package fa.academy.kiotviet.application.controller.web;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Page controller for serving system admin templates.
 * All endpoints require system_admin role.
 *
 * This controller serves Thymeleaf templates for the system admin panel.
 * No business logic is performed here - only template serving.
 */
@Controller
@RequestMapping("/admin")
@PreAuthorize("hasRole('SYSTEM_ADMIN')")
public class SystemAdminPageController {

    /**
     * System admin dashboard page.
     * GET /admin/dashboard
     *
     * @return Template name for admin dashboard
     */
    @GetMapping("/dashboard")
    public String adminDashboard() {
        return "admin/admin-dashboard";
    }

    /**
     * Company list page.
     * GET /admin/companies
     *
     * @return Template name for company list
     */
    @GetMapping("/companies")
    public String companyList() {
        return "admin/admin-company-list";
    }

    /**
     * Company details page.
     * GET /admin/companies/{id}
     *
     * @param id Company ID (passed to template)
     * @return Template name for company details
     */
    @GetMapping("/companies/{id}")
    public String companyDetails(@PathVariable Long id) {
        return "admin/admin-company-details";
    }

    /**
     * User list page.
     * GET /admin/users
     *
     * @return Template name for user list
     */
    @GetMapping("/users")
    public String userList() {
        return "admin/admin-user-list";
    }

    /**
     * User details page.
     * GET /admin/users/{id}
     *
     * @param id User ID (passed to template)
     * @return Template name for user details
     */
    @GetMapping("/users/{id}")
    public String userDetails(@PathVariable Long id) {
        return "admin/admin-user-details";
    }
}
