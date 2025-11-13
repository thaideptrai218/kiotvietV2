package fa.academy.kiotviet.application.controller.api;

import fa.academy.kiotviet.application.dto.shared.SuccessResponse;
import fa.academy.kiotviet.application.service.ResponseFactory;
import fa.academy.kiotviet.infrastructure.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Test controller for verifying JWT authentication functionality.
 * These endpoints are protected and require valid JWT tokens.
 */
@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class TestController {

    /**
     * Test endpoint that requires authentication.
     * Returns user information from JWT token.
     */
    @GetMapping("/auth-info")
    public SuccessResponse<Map<String, Object>> getAuthInfo() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication.getPrincipal() instanceof JwtAuthenticationFilter.UserPrincipal)) {
            return ResponseFactory.success(null, "No authentication found");
        }

        JwtAuthenticationFilter.UserPrincipal userPrincipal =
            (JwtAuthenticationFilter.UserPrincipal) authentication.getPrincipal();

        Map<String, Object> userInfo = new HashMap<>();
        userInfo.put("userId", userPrincipal.getUserId());
        userInfo.put("companyId", userPrincipal.getCompanyId());
        userInfo.put("username", userPrincipal.getUsername());
        userInfo.put("role", userPrincipal.getRole());
        userInfo.put("message", "JWT authentication successful!");

        return ResponseFactory.success(userInfo, "Authentication info retrieved successfully");
    }

    /**
     * Simple test endpoint to verify authentication is working.
     */
    @GetMapping("/hello")
    public SuccessResponse<String> hello() {
        return ResponseFactory.success("Hello, authenticated user!", "Test endpoint accessed successfully");
    }

    /**
     * Test endpoint with role-based response.
     */
    @GetMapping("/role-check")
    public SuccessResponse<Map<String, Object>> checkRole() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication.getPrincipal() instanceof JwtAuthenticationFilter.UserPrincipal)) {
            return ResponseFactory.success(null, "No authentication found");
        }

        JwtAuthenticationFilter.UserPrincipal userPrincipal =
            (JwtAuthenticationFilter.UserPrincipal) authentication.getPrincipal();

        Map<String, Object> roleInfo = new HashMap<>();
        roleInfo.put("role", userPrincipal.getRole());
        roleInfo.put("isAdmin", "ADMIN".equals(userPrincipal.getRole()));
        roleInfo.put("isManager", "MANAGER".equals(userPrincipal.getRole()));
        roleInfo.put("isUser", "USER".equals(userPrincipal.getRole()));

        return ResponseFactory.success(roleInfo, "Role information retrieved successfully");
    }
}
