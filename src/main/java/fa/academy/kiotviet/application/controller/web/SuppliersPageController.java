package fa.academy.kiotviet.application.controller.web;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/suppliers")
public class SuppliersPageController {

    @GetMapping
    public String suppliers(Model model) {
        model.addAttribute("canManage", canManageSuppliers());
        return "suppliers/supplier";
    }

    private boolean canManageSuppliers() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        return auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") 
                        || a.getAuthority().equals("ROLE_MANAGER")
                        || a.getAuthority().equals("PRODUCT_MANAGE"));
    }
}
