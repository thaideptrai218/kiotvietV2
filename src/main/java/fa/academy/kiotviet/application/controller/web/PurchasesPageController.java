package fa.academy.kiotviet.application.controller.web;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/purchases")
public class PurchasesPageController {

    @GetMapping
    public String purchases(Model model) {
        model.addAttribute("canManage", canManagePurchases());
        return "purchases/purchases";
    }

    private boolean canManagePurchases() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        return auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") 
                        || a.getAuthority().equals("ROLE_MANAGER")
                        || a.getAuthority().equals("PURCHASE_MANAGE"));
    }
}

