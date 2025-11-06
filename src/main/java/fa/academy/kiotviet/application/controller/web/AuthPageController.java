package fa.academy.kiotviet.application.controller.web;

import fa.academy.kiotviet.application.controller.shared.BaseController;
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

        model.addAttribute("registrationForm", new RegistrationForm());

        logResponse("/auth/register", "GET", "register template");
        return "auth/register";
    }

    @PostMapping("/register")
    public String handleRegistration(@Valid @ModelAttribute("registrationForm") RegistrationForm form,
                                   BindingResult result, Model model) {
        logRequest("/auth/register", "POST", form);

        if (result.hasErrors()) {
            log.warn("Registration validation errors: {}", result.getAllErrors());
            return "auth/register";
        }

        // TODO: Process registration logic
        // authService.register(form);

        log.info("User registered successfully: {}", form.getEmail());
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

        // TODO: Process login logic
        // AuthResponse authResponse = authService.login(form);

        log.info("User logged in successfully: {}", form.getEmail());
        redirectAttributes.addFlashAttribute("message", "Login successful");

        return redirectTo("/dashboard");
    }

    // Form objects for web pages
    public static class LoginForm {
        private String email;
        private String password;
        private boolean rememberMe;

        // Getters and setters
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public boolean isRememberMe() { return rememberMe; }
        public void setRememberMe(boolean rememberMe) { this.rememberMe = rememberMe; }
    }

    public static class RegistrationForm {
        private String name;
        private String email;
        private String password;
        private String confirmPassword;
        private String phone;

        // Getters and setters
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
        public String getConfirmPassword() { return confirmPassword; }
        public void setConfirmPassword(String confirmPassword) { this.confirmPassword = confirmPassword; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
    }
}