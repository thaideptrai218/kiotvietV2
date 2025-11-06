package fa.academy.kiotviet.application.controller.api;

import fa.academy.kiotviet.application.dto.auth.response.AuthResponse;
import fa.academy.kiotviet.application.dto.auth.request.RegistrationRequest;
import fa.academy.kiotviet.application.dto.shared.SuccessResponse;
import fa.academy.kiotviet.application.service.ResponseFactory;
import fa.academy.kiotviet.core.usermanagement.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthApiController {

    private final AuthService authService;

    @PostMapping("/register")
    public SuccessResponse<AuthResponse> registerUser(@Valid @RequestBody RegistrationRequest registrationRequest) {
        AuthResponse authResponse = authService.register(registrationRequest);
        return ResponseFactory.success(authResponse, "User registered successfully");
    }
}