package fa.academy.kiotviet.application.controller.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/purchases")
public class PurchasesPageController {

    @GetMapping
    public String purchases() {
        return "purchases/purchases";
    }
}

