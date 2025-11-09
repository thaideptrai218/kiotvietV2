package fa.academy.kiotviet.application.controller.web;

import fa.academy.kiotviet.application.controller.shared.BaseController;
import fa.academy.kiotviet.application.dto.auth.request.RegistrationRequest;
import fa.academy.kiotviet.application.dto.form.LoginForm;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

@Controller
@RequestMapping("/auth")
@Slf4j
public class AuthPageController extends BaseController {

    @GetMapping("/login")
    public String showLoginPage(Model model) {
        logRequest("/auth/login", "GET", "Login page requested");

        model.addAttribute("loginForm", new LoginForm());

        logResponse("/auth/login", "GET", "login template");
        return "auth/login";
    }

    @GetMapping("/register")
    public String showRegisterPage(Model model) {
        logRequest("/auth/register", "GET", "Register page requested");

        model.addAttribute("registrationRequest", new RegistrationRequest());

        logResponse("/auth/register", "GET", "register template");
        return "auth/register";
    }

    @PostMapping("/register")
    public String handleRegistration(@Valid @ModelAttribute("registrationRequest") RegistrationRequest request,
            BindingResult result, Model model) {
        logRequest("/auth/register", "POST", request);

        if (result.hasErrors()) {
            log.warn("Registration validation errors: {}", result.getAllErrors());
            return "auth/register";
        }

        log.info("User registered successfully: {}", request.getEmail());
        return redirectTo("/auth/login?registered=true");
    }

    @PostMapping("/login")
    public String handleLogin(@Valid @ModelAttribute("loginForm") LoginForm form,
            BindingResult result, RedirectAttributes redirectAttributes) {
        logRequest("/auth/login", "POST", form);

        if (result.hasErrors()) {
            log.warn("Login validation errors: {}", result.getAllErrors());
            return "auth/login";
        }

        log.info("User logged in successfully: {}", form.getEmail());
        redirectAttributes.addFlashAttribute("message", "Login successful");

        return redirectTo("/dashboard");
    }

    @GetMapping("/reset")
    public String showResetPage(@RequestParam(value = "token", required = false) String token, Model model) {
        logRequest("/auth/reset", "GET", token != null ? "token provided" : "no token");
        model.addAttribute("token", token);
        logResponse("/auth/reset", "GET", "reset template");
        return "auth/reset";
    }
}
