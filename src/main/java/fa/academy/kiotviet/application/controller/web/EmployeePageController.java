package fa.academy.kiotviet.application.controller.web;

import fa.academy.kiotviet.core.usermanagement.domain.UserInfo;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class EmployeePageController {

    @GetMapping("/employees")
    public String employees(Model model) {
        model.addAttribute("permissions", UserInfo.UserPermission.values());
        return "modules/employees/employee";
    }
}
