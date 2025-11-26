package fa.academy.kiotviet.application.controller.web;

import fa.academy.kiotviet.application.controller.shared.BaseController;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Slf4j
@Controller
@RequestMapping("/order")
public class OrdersPageController extends BaseController {

    @GetMapping
    public String ordersPage() {
        logRequest("/order", "GET", null);
        return "orders/order";
    }

    @GetMapping("/create")
    public String createOrderPage() {
        logRequest("/order/create", "GET", null);
        return "orders/order-create";
    }
}