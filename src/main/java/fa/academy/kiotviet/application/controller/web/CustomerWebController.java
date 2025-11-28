package fa.academy.kiotviet.application.controller.web;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
@RequestMapping("/customers")
public class CustomerWebController {

    @GetMapping
    public String index(Model model) {
        model.addAttribute("activeLink", "customers");
        return "customers/customers";
    }
}
