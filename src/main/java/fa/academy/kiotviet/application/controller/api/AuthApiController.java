package fa.academy.kiotviet.application.controller.api;

import fa.academy.kiotviet.application.dto.auth.response.AuthResponse;
import fa.academy.kiotviet.application.dto.auth.request.LoginRequest;
import fa.academy.kiotviet.application.dto.auth.request.RegistrationRequest;
import fa.academy.kiotviet.application.dto.shared.SuccessResponse;
import fa.academy.kiotviet.application.service.ResponseFactory;
import fa.academy.kiotviet.core.usermanagement.service.auth.AuthService;
import fa.academy.kiotviet.core.usermanagement.service.registration.RegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthApiController {

    private final AuthService authService;
    private final RegistrationService registrationService;

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
    public SuccessResponse<Void> logout(@RequestBody Map<String, Long> request) {
        Long userId = request.get("userId");
        authService.logout(userId);
        return ResponseFactory.success(null, "Logout successful");
    }

    @PostMapping("/logout/device")
    public SuccessResponse<Void> logoutFromDevice(@RequestBody Map<String, Long> request) {
        Long tokenId = request.get("tokenId");
        authService.logoutFromDevice(tokenId);
        return ResponseFactory.success(null, "Device logout successful");
    }
}