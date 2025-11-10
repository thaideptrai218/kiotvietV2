package fa.academy.kiotviet.application.controller.web;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/suppliers")
public class SuppliersPageController {

    @GetMapping
    public String suppliers() {
        // Serve the page without server-side auth check.
        // Frontend JS will attach JWT for API calls and handle 401s.
        return "suppliers/supplier";
    }
}
