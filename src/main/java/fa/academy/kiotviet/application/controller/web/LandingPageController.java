package fa.academy.kiotviet.application.controller.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Controller for the landing page and public-facing pages.
 * Handles the main index route and redirects to the landing page.
 */
@Controller
@RequestMapping("/")
public class LandingPageController {

    /**
     * Main landing page endpoint.
     * Serves the modern SaaS landing page with all sections.
     *
     * @return Landing page template
     */
    @GetMapping
    public String landingPage() {
        return "core/layout/landing";
    }

    /**
     * Home endpoint that also redirects to landing page.
     * Provides alternative route for users accessing /home
     *
     * @return Landing page template
     */
    @GetMapping("/home")
    public String home() {
        return "redirect:/";
    }

    /**
     * About page endpoint.
     * Shows company information and story.
     *
     * @return About page template (future implementation)
     */
    @GetMapping("/about")
    public String about() {
        return "core/layout/about"; // Future implementation
    }
}