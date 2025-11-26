package fa.academy.kiotviet.application.controller.web;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/inventory")
public class InventoryPageController {

    @GetMapping
    public String listPage() {
        return "modules/inventory/list";
    }

    @GetMapping("/create")
    public String createPage(Model model) {
        model.addAttribute("mode", "create");
        return "modules/inventory/form";
    }

    @GetMapping("/edit/{id}")
    public String editPage(
            @PathVariable Long id,
            Model model
    ) {
        model.addAttribute("mode", "edit");
        model.addAttribute("inventoryId", id);
        return "modules/inventory/form";
    }
}