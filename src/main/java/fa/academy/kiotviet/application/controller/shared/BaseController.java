package fa.academy.kiotviet.application.controller.shared;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.ModelAttribute;

import java.time.LocalDateTime;

@Slf4j
public abstract class BaseController {

    // Add common data to all controllers
    @ModelAttribute("currentTime")
    public LocalDateTime getCurrentTime() {
        return LocalDateTime.now();
    }

    @ModelAttribute("requestPath")
    public String getRequestPath(HttpServletRequest request) {
        return request.getRequestURI();
    }

    // Utility methods for controllers
    protected String getClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    protected void logRequest(String endpoint, String method, Object payload) {
        log.info("Request: {} {} - Payload: {}", method, endpoint, payload);
    }

    protected void logResponse(String endpoint, String method, Object response) {
        log.info("Response: {} {} - Response: {}", method, endpoint, response);
    }

    // Common redirect patterns
    protected String redirectTo(String path) {
        return "redirect:" + path;
    }

    protected String redirectTo(String path, String fragment) {
        return "redirect:" + path + "#" + fragment;
    }
}