package fa.academy.kiotviet.application.controller.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.ui.Model;

/**
 * Controller for dashboard access.
 * Spring Security handles authentication automatically.
 */
@Controller
@RequestMapping("/dashboard")
public class DashboardController {

    /**
     * Main dashboard endpoint.
     * Spring Security will automatically redirect unauthenticated users to login.
     *
     * @return Dashboard template
     */
    @GetMapping
    public String dashboard(Model model) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // Add user information to the model
        if (authentication != null && authentication.isAuthenticated() &&
            !"anonymousUser".equals(authentication.getPrincipal())) {

            // Add user details to the model if available
            model.addAttribute("username", authentication.getName());

            // If the authentication contains more user details, add them too
            if (authentication.getPrincipal() != null) {
                model.addAttribute("userDetails", authentication.getPrincipal());
            }
        }

        return "dashboard/dashboard";
    }

    @GetMapping("/revenue")
    public String revenueDashboard(Model model) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        // Add user information to model
        if (authentication != null && authentication.isAuthenticated() &&
            !"anonymousUser".equals(authentication.getPrincipal())) {

            // Add user details to model if available
            model.addAttribute("username", authentication.getName());

            // If authentication contains more user details, add them too
            if (authentication.getPrincipal() != null) {
                model.addAttribute("userDetails", authentication.getPrincipal());
            }
        }

        return "dashboard/dashboard-revenue";
    }
}