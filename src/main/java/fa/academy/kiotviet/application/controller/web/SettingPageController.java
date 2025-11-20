package fa.academy.kiotviet.application.controller.web;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SettingPageController {
@GetMapping("/setting")
    public String setting() {
        return "modules/setting/setting"; 
    }

}
