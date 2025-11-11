package fa.academy.kiotviet.application.controller.api;

import fa.academy.kiotviet.application.dto.shared.SuccessResponse;
import fa.academy.kiotviet.application.dto.user.request.UpdateProfileRequest;
import fa.academy.kiotviet.application.dto.user.request.ChangePasswordRequest;
import fa.academy.kiotviet.application.dto.user.response.ProfileResponse;
import fa.academy.kiotviet.application.dto.user.request.TwoFactorVerifyRequest;
import fa.academy.kiotviet.application.dto.user.response.TwoFactorStatusResponse;
import fa.academy.kiotviet.application.service.ResponseFactory;
import fa.academy.kiotviet.core.usermanagement.domain.UserInfo;
import fa.academy.kiotviet.core.usermanagement.repository.UserInfoRepository;
import fa.academy.kiotviet.core.usermanagement.repository.UserAuthRepository;
import fa.academy.kiotviet.core.usermanagement.domain.UserAuth;
import fa.academy.kiotviet.core.usermanagement.service.user.UserService;
import fa.academy.kiotviet.core.usermanagement.service.auth.TwoFactorService;
import fa.academy.kiotviet.infrastructure.security.JwtAuthenticationFilter;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class ProfileApiController {

    private final UserService userService;
    private final UserInfoRepository userInfoRepository;
    private final UserAuthRepository userAuthRepository;
    private final PasswordEncoder passwordEncoder;
    private final TwoFactorService twoFactorService;

    private JwtAuthenticationFilter.UserPrincipal currentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof JwtAuthenticationFilter.UserPrincipal)) {
            return null;
        }
        return (JwtAuthenticationFilter.UserPrincipal) authentication.getPrincipal();
    }

    @GetMapping
    public ResponseEntity<?> getProfile() {
        JwtAuthenticationFilter.UserPrincipal principal = currentUser();
        if (principal == null) {
            return ResponseEntity.status(401).body(ResponseFactory.unauthorized("User not authenticated", "UNAUTHORIZED"));
        }

        Optional<UserInfo> userOpt = userInfoRepository.findById(principal.getUserId());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(ResponseFactory.notFound("User not found", "USER_NOT_FOUND"));
        }

        UserInfo user = userOpt.get();
        ProfileResponse dto = new ProfileResponse(
                user.getId(),
                user.getCompany() != null ? user.getCompany().getId() : null,
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getPhone(),
                user.getRole() != null ? user.getRole().name() : null,
                user.getIsActive()
        );
        return ResponseEntity.ok(ResponseFactory.success(dto, "Profile retrieved successfully"));
    }

    @PutMapping
    public ResponseEntity<?> updateProfile(@Valid @RequestBody UpdateProfileRequest request) {
        JwtAuthenticationFilter.UserPrincipal principal = currentUser();
        if (principal == null) {
            return ResponseEntity.status(401).body(ResponseFactory.unauthorized("User not authenticated", "UNAUTHORIZED"));
        }

        Optional<UserInfo> userOpt = userInfoRepository.findById(principal.getUserId());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(ResponseFactory.notFound("User not found", "USER_NOT_FOUND"));
        }

        UserInfo user = userOpt.get();

        // Only allow editing safe fields here
        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());

        // Optional: allow email update if it doesn't conflict
        if (request.getEmail() != null && !request.getEmail().equals(user.getEmail())) {
            // enforce uniqueness in company context if company exists, else global
            boolean exists;
            if (user.getCompany() != null) {
                exists = userInfoRepository.existsByEmailAndCompanyId(request.getEmail(), user.getCompany().getId());
            } else {
                exists = userService.existsByEmail(request.getEmail());
            }
            if (exists) {
                return ResponseEntity.badRequest().body(ResponseFactory.error("Email already in use", "EMAIL_EXISTS"));
            }
            user.setEmail(request.getEmail());
        }

        UserInfo saved = userService.save(user);

        ProfileResponse dto = new ProfileResponse(
                saved.getId(),
                saved.getCompany() != null ? saved.getCompany().getId() : null,
                saved.getUsername(),
                saved.getEmail(),
                saved.getFullName(),
                saved.getPhone(),
                saved.getRole() != null ? saved.getRole().name() : null,
                saved.getIsActive()
        );

        SuccessResponse<ProfileResponse> response = ResponseFactory.success(dto, "Profile updated successfully");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequest request) {
        JwtAuthenticationFilter.UserPrincipal principal = currentUser();
        if (principal == null) {
            return ResponseEntity.status(401).body(ResponseFactory.unauthorized("User not authenticated", "UNAUTHORIZED"));
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            return ResponseEntity.badRequest().body(ResponseFactory.error("Passwords do not match", "PASSWORD_MISMATCH"));
        }

        Optional<UserInfo> userOpt = userInfoRepository.findById(principal.getUserId());
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(404).body(ResponseFactory.notFound("User not found", "USER_NOT_FOUND"));
        }

        UserInfo user = userOpt.get();
        UserAuth userAuth = userAuthRepository.findByUserId(user.getId())
                .orElse(null);
        if (userAuth == null) {
            return ResponseEntity.status(404).body(ResponseFactory.notFound("Authentication record not found", "AUTH_NOT_FOUND"));
        }

        // verify current password
        boolean matches = passwordEncoder.matches(request.getCurrentPassword() + userAuth.getSalt(), userAuth.getPasswordHash());
        if (!matches) {
            return ResponseEntity.badRequest().body(ResponseFactory.error("Current password is incorrect", "INVALID_CURRENT_PASSWORD"));
        }

        // generate new salt and update hash
        String newSalt = java.util.UUID.randomUUID().toString();
        String newHash = passwordEncoder.encode(request.getNewPassword() + newSalt);
        userAuth.setSalt(newSalt);
        userAuth.setPasswordHash(newHash);
        userAuth.setFailedAttempts(0);
        userAuthRepository.save(userAuth);

        return ResponseEntity.ok(ResponseFactory.success(null, "Password updated successfully"));
    }

    // ===== Two-Factor Authentication (SMS) =====
    @GetMapping("/2fa/status")
    public ResponseEntity<?> twoFactorStatus() {
        JwtAuthenticationFilter.UserPrincipal principal = currentUser();
        if (principal == null) {
            return ResponseEntity.status(401).body(ResponseFactory.unauthorized("User not authenticated", "UNAUTHORIZED"));
        }
        boolean enabled = twoFactorService.isEnabled(principal.getUserId());
        String masked = twoFactorService.maskedEmail(principal.getUserId());
        return ResponseEntity.ok(ResponseFactory.success(new TwoFactorStatusResponse(enabled, masked), "2FA status"));
    }

    @PostMapping("/2fa/send-code")
    public ResponseEntity<?> sendTwoFactorCode() {
        JwtAuthenticationFilter.UserPrincipal principal = currentUser();
        if (principal == null) {
            return ResponseEntity.status(401).body(ResponseFactory.unauthorized("User not authenticated", "UNAUTHORIZED"));
        }
        twoFactorService.sendSetupCodeEmail(principal.getUserId());
        return ResponseEntity.ok(ResponseFactory.success(null, "Verification code sent"));
    }

    @PostMapping("/2fa/verify")
    public ResponseEntity<?> verifyTwoFactor(@Valid @RequestBody TwoFactorVerifyRequest request) {
        JwtAuthenticationFilter.UserPrincipal principal = currentUser();
        if (principal == null) {
            return ResponseEntity.status(401).body(ResponseFactory.unauthorized("User not authenticated", "UNAUTHORIZED"));
        }
        boolean ok = twoFactorService.verifySetupCode(principal.getUserId(), request.getCode());
        if (!ok) {
            return ResponseEntity.badRequest().body(ResponseFactory.error("Invalid or expired code", "INVALID_CODE"));
        }
        return ResponseEntity.ok(ResponseFactory.success(null, "Two-factor authentication enabled"));
    }

    @DeleteMapping("/2fa")
    public ResponseEntity<?> disableTwoFactor() {
        JwtAuthenticationFilter.UserPrincipal principal = currentUser();
        if (principal == null) {
            return ResponseEntity.status(401).body(ResponseFactory.unauthorized("User not authenticated", "UNAUTHORIZED"));
        }
        boolean ok = twoFactorService.disable(principal.getUserId());
        if (!ok) {
            return ResponseEntity.status(404).body(ResponseFactory.notFound("User not found", "USER_NOT_FOUND"));
        }
        return ResponseEntity.ok(ResponseFactory.success(null, "Two-factor authentication disabled"));
    }
}

