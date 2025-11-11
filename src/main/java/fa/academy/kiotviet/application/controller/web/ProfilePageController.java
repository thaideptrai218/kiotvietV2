package fa.academy.kiotviet.application.controller.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

/**
 * Controller serving the user profile page.
 */
@Controller
@RequestMapping("/profile")
public class ProfilePageController {

    /**
     * Render profile page template. Data will be fetched client-side via API using JWT.
     */
    @GetMapping
    public String profilePage() {
        return "profile/profile";
    }
}

