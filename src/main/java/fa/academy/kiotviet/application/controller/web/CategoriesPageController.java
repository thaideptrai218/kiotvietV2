package fa.academy.kiotviet.application.controller.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.ui.Model;

/**
 * Controller for category management page access.
 * Spring Security handles authentication automatically.
 */
@Controller
@RequestMapping("/categories")
public class CategoriesPageController {

    /**
     * Category management page endpoint.
     * Spring Security will automatically redirect unauthenticated users to login.
     * Test change to trigger Claude PR review workflow.
     *
     * @return Category management template
     */
    @GetMapping
    public String categories(Model model) {
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

        return "modules/categories/categories";
    }
}