package fa.academy.kiotviet.application.controller.api;

import fa.academy.kiotviet.application.dto.shared.SuccessResponse;
import fa.academy.kiotviet.application.dto.user.request.UpdateProfileRequest;
import fa.academy.kiotviet.application.dto.user.response.ProfileResponse;
import fa.academy.kiotviet.application.service.ResponseFactory;
import fa.academy.kiotviet.core.usermanagement.domain.UserInfo;
import fa.academy.kiotviet.core.usermanagement.repository.UserInfoRepository;
import fa.academy.kiotviet.core.usermanagement.service.user.UserService;
import fa.academy.kiotviet.infrastructure.security.JwtAuthenticationFilter;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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
}

