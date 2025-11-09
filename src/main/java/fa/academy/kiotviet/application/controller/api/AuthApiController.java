package fa.academy.kiotviet.application.controller.api;

import fa.academy.kiotviet.application.dto.auth.response.AuthResponse;
import fa.academy.kiotviet.application.dto.auth.request.LoginRequest;
import fa.academy.kiotviet.application.dto.auth.request.RegistrationRequest;
import fa.academy.kiotviet.application.dto.auth.request.ForgotPasswordRequest;
import fa.academy.kiotviet.application.dto.auth.request.ResetPasswordRequest;
import fa.academy.kiotviet.application.dto.shared.SuccessResponse;
import fa.academy.kiotviet.application.service.ResponseFactory;
import fa.academy.kiotviet.core.usermanagement.service.auth.AuthService;
import fa.academy.kiotviet.core.usermanagement.service.registration.RegistrationService;
import fa.academy.kiotviet.core.usermanagement.service.auth.PasswordResetService;
import jakarta.servlet.http.HttpServletRequest;
import fa.academy.kiotviet.infrastructure.security.JwtAuthenticationFilter;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthApiController {

    private final AuthService authService;
    private final RegistrationService registrationService;
    private final PasswordResetService passwordResetService;

    @PostMapping("/register")
    public SuccessResponse<AuthResponse> registerUser(@Valid @RequestBody RegistrationRequest registrationRequest) {
        AuthResponse authResponse = registrationService.register(registrationRequest);
        return ResponseFactory.success(authResponse, "User registered successfully");
    }

    @PostMapping("/login")
    public SuccessResponse<AuthResponse> loginUser(@Valid @RequestBody LoginRequest loginRequest) {
        AuthResponse authResponse = authService.login(loginRequest);
        return ResponseFactory.success(authResponse, "Login successful");
    }

    @PostMapping("/refresh")
    public SuccessResponse<AuthResponse> refreshToken(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refreshToken");
        AuthResponse authResponse = authService.refreshToken(refreshToken);
        return ResponseFactory.success(authResponse, "Token refreshed successfully");
    }

    @PostMapping("/logout")
    public SuccessResponse<Void> logout() {
        // Get current authenticated user from security context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication.getPrincipal() instanceof JwtAuthenticationFilter.UserPrincipal)) {
            return ResponseFactory.success(null, "No authenticated user found");
        }

        JwtAuthenticationFilter.UserPrincipal userPrincipal =
            (JwtAuthenticationFilter.UserPrincipal) authentication.getPrincipal();

        // Logout current user by invalidating their refresh tokens
        authService.logout(userPrincipal.getUserId());
        return ResponseFactory.success(null, "Logout successful");
    }

    @PostMapping("/logout/device")
    public SuccessResponse<Void> logoutFromDevice(@RequestBody Map<String, Long> request) {
        // Get current authenticated user from security context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication.getPrincipal() instanceof JwtAuthenticationFilter.UserPrincipal)) {
            return ResponseFactory.success(null, "No authenticated user found");
        }

        JwtAuthenticationFilter.UserPrincipal userPrincipal =
            (JwtAuthenticationFilter.UserPrincipal) authentication.getPrincipal();

        Long tokenId = request.get("tokenId");
        if (tokenId == null) {
            return ResponseFactory.success(null, "Token ID is required");
        }

        // Logout from specific device (validate token belongs to current user)
        authService.logoutFromDevice(tokenId, userPrincipal.getUserId());
        return ResponseFactory.success(null, "Device logout successful");
    }

    @PostMapping("/forgot")
    public SuccessResponse<Void> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request,
                                                HttpServletRequest httpRequest) {
        passwordResetService.requestReset(request, httpRequest);
        return ResponseFactory.success(null, "If the account exists, a reset link has been sent");
    }

    @PostMapping("/reset")
    public SuccessResponse<Void> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        passwordResetService.resetPassword(request);
        return ResponseFactory.success(null, "Password has been reset successfully");
    }
}
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser() {
        // Get current authenticated user from security context
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !(authentication.getPrincipal() instanceof JwtAuthenticationFilter.UserPrincipal)) {
            return ResponseEntity.status(401).body(ResponseFactory.unauthorized("User not authenticated", "UNAUTHORIZED"));
        }

        JwtAuthenticationFilter.UserPrincipal userPrincipal =
            (JwtAuthenticationFilter.UserPrincipal) authentication.getPrincipal();

        // Return user information (using default company name for simplicity)
        AuthResponse.UserInfo userInfo = new AuthResponse.UserInfo(
                userPrincipal.getUserId(),
                userPrincipal.getCompanyId(),
                "Company", // Default company name
                userPrincipal.getUsername(),
                userPrincipal.getEmail(),
                userPrincipal.getFullName(),
                userPrincipal.getRole()
        );

        return ResponseEntity.ok(ResponseFactory.success(userInfo, "User retrieved successfully"));
    }
}
