package fa.academy.kiotviet.application.controller.web;

import fa.academy.kiotviet.application.controller.shared.BaseController;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;

@Slf4j
@Controller
@RequestMapping("/products")
public class ProductsPageController extends BaseController {

    @GetMapping
    public String productsPage(Model model) {
        logRequest("/products", "GET", null);
        model.addAttribute("canManage", canManageProducts());
        return "products/products";
    }

    @GetMapping("/new")
    public String createProductPage(Model model) {
        logRequest("/products/new", "GET", null);
        model.addAttribute("canManage", canManageProducts());
        return "products/create";
    }

    @GetMapping("/{id}/edit")
    public String editProductPage(@PathVariable Long id, Model model) {
        logRequest("/products/" + id + "/edit", "GET", null);
        model.addAttribute("canManage", canManageProducts());
        return "products/edit";
    }

    @GetMapping("/{id}")
    public String viewProductPage(@PathVariable Long id, Model model) {
        logRequest("/products/" + id, "GET", null);
        model.addAttribute("canManage", canManageProducts());
        return "products/view";
    }

    @GetMapping("/import")
    public String importProductsPage(Model model) {
        logRequest("/products/import", "GET", null);
        model.addAttribute("canManage", canManageProducts());
        return "products/import";
    }

    @GetMapping("/export")
    public String exportProductsPage(Model model) {
        logRequest("/products/export", "GET", null);
        model.addAttribute("canManage", canManageProducts());
        return "products/export";
    }

    private boolean canManageProducts() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        return auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") 
                        || a.getAuthority().equals("ROLE_MANAGER")
                        || a.getAuthority().equals("PRODUCT_MANAGE"));
    }
}