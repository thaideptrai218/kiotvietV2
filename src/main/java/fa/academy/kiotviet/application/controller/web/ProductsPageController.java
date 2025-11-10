package fa.academy.kiotviet.application.controller.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/products")
public class ProductsPageController {

    @GetMapping
    public String products() {
        // Serve the page without server-side auth check.
        // Frontend JS will attach JWT for API calls and handle 401s.
        return "products/products";
    }
}