package fa.academy.kiotviet.application.controller.web;

import fa.academy.kiotviet.application.controller.shared.BaseController;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

@Slf4j
@Controller
@RequestMapping("/products")
public class ProductsPageController extends BaseController {

    @GetMapping
    public String productsPage() {
        logRequest("/products", "GET", null);
        return "products/products";
    }

    @GetMapping("/new")
    public String createProductPage() {
        logRequest("/products/new", "GET", null);
        return "products/create";
    }

    @GetMapping("/{id}/edit")
    public String editProductPage(@PathVariable Long id) {
        logRequest("/products/" + id + "/edit", "GET", null);
        return "products/edit";
    }

    @GetMapping("/{id}")
    public String viewProductPage(@PathVariable Long id) {
        logRequest("/products/" + id, "GET", null);
        return "products/view";
    }

    @GetMapping("/import")
    public String importProductsPage() {
        logRequest("/products/import", "GET", null);
        return "products/import";
    }

    @GetMapping("/export")
    public String exportProductsPage() {
        logRequest("/products/export", "GET", null);
        return "products/export";
    }
}