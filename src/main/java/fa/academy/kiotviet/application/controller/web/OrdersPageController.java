package fa.academy.kiotviet.application.controller.web;

import fa.academy.kiotviet.application.controller.shared.BaseController;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Slf4j
@Controller
@RequestMapping("/order")
public class OrdersPageController extends BaseController {

    @GetMapping
    public String ordersPage(Model model) {
        logRequest("/order", "GET", null);
        model.addAttribute("canManage", canManageOrders());
        return "orders/order";
    }

    @GetMapping("/create")
    public String createOrderPage(Model model) {
        logRequest("/order/create", "GET", null);
        model.addAttribute("canManage", canManageOrders());
        return "orders/order-create";
    }

    private boolean canManageOrders() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) return false;
        return auth.getAuthorities().stream()
            .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") 
                        || a.getAuthority().equals("ROLE_MANAGER")
                        || a.getAuthority().equals("ORDER_MANAGE"));
    }
}