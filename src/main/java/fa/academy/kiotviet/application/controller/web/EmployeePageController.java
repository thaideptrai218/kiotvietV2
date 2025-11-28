package fa.academy.kiotviet.application.controller.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class EmployeePageController {

    @GetMapping("/employees")
    public String employees() {
        return "modules/employees/employee";
    }
}
