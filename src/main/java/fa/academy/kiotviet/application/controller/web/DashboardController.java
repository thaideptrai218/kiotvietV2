package fa.academy.kiotviet.application.controller.web;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Controller for dashboard access from the landing page.
 * Handles authentication checks and redirects appropriately.
 */
@Controller
@RequestMapping("/dashboard")
public class DashboardController {

    /**
     * Main dashboard endpoint.
     * Checks authentication and provides appropriate response.
     *
     * @return Dashboard template or redirect to login
     */
    @GetMapping
    public String dashboard() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // Check if user is authenticated
        if (authentication == null || !authentication.isAuthenticated() ||
            "anonymousUser".equals(authentication.getPrincipal())) {
            // User is not authenticated, redirect to login
            return "redirect:/login?redirect=/dashboard";
        }

        // User is authenticated, show dashboard
        // This will be implemented in future weeks
        return "modules/dashboard/dashboard"; // Future implementation
    }

    /**
     * Dashboard access from landing page.
     * Handles the specific "Go to Dashboard" functionality.
     *
     * @return Dashboard template or redirect to login
     */
    @GetMapping("/access")
    public String accessDashboard() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // Check if user is authenticated
        if (authentication == null || !authentication.isAuthenticated() ||
            "anonymousUser".equals(authentication.getPrincipal())) {
            // User is not authenticated, redirect to login with return URL
            return "redirect:/login?redirect=/dashboard&from=landing";
        }

        // User is authenticated, redirect to main dashboard
        return "redirect:/dashboard";
    }
}