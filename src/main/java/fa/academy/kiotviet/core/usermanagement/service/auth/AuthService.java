package fa.academy.kiotviet.core.usermanagement.service.auth;

import fa.academy.kiotviet.application.dto.auth.request.LoginRequest;
import fa.academy.kiotviet.application.dto.auth.response.AuthResponse;
import fa.academy.kiotviet.core.usermanagement.domain.UserAuth;
import fa.academy.kiotviet.core.usermanagement.domain.UserInfo;
import fa.academy.kiotviet.core.usermanagement.domain.UserToken;
import fa.academy.kiotviet.core.usermanagement.repository.UserAuthRepository;
import fa.academy.kiotviet.core.usermanagement.repository.UserInfoRepository;
import fa.academy.kiotviet.core.usermanagement.repository.UserTokenRepository;
import fa.academy.kiotviet.infrastructure.security.JwtUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.UUID;

/**
 * Service handling authentication operations including login, logout,
 * token generation, and user verification.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserInfoRepository userInfoRepository;
    private final UserAuthRepository userAuthRepository;
    private final UserTokenRepository userTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    /**
     * Authenticate user with username and password.
     *
     * @param request Login request with credentials
     * @return Authentication response with tokens
     */
    @Transactional
    public AuthResponse login(LoginRequest request) {
        // Find user by username
        UserInfo user = userInfoRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Invalid username or password"));

        // Get user authentication details
        UserAuth userAuth = userAuthRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Invalid authentication details"));

        // Security validations
        validateUserAndCompanyStatus(user);

        // Check account lockout
        if (userAuth.getFailedAttempts() >= 5) {
            throw new IllegalArgumentException("Account is locked due to too many failed login attempts");
        }

        // Verify password
        if (!passwordEncoder.matches(request.getPassword() + userAuth.getSalt(), userAuth.getPasswordHash())) {
            incrementFailedAttempts(userAuth);
            throw new IllegalArgumentException("Invalid username or password");
        }

        // Reset failed attempts on successful login
        resetFailedAttempts(userAuth);

        // Generate and save tokens
        return generateAuthResponse(user, "Login");
    }

    /**
     * Auto-login for newly registered users.
     *
     * @param user Newly created user
     * @return Authentication response with tokens
     */
    @Transactional
    public AuthResponse autoLogin(UserInfo user) {
        return generateAuthResponse(user, "Registration");
    }

    /**
     * Refresh JWT tokens using valid refresh token.
     *
     * @param refreshToken Valid refresh token
     * @return New authentication response
     */
    @Transactional
    public AuthResponse refreshToken(String refreshToken) {
        // Validate refresh token and get user
        UserToken token = userTokenRepository.findByRefreshTokenHash(hashRefreshToken(refreshToken))
                .filter(UserToken::getIsActive)
                .filter(t -> t.getExpiresAt().isAfter(LocalDateTime.now()))
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired refresh token"));

        UserInfo user = token.getUser();

        // Deactivate old token
        token.setIsActive(false);
        userTokenRepository.save(token);

        // Generate new tokens
        return generateAuthResponse(user, "Token Refresh");
    }

    /**
     * Logout user by invalidating their refresh tokens.
     *
     * @param userId User ID to logout
     */
    @Transactional
    public void logout(Long userId) {
        userTokenRepository.deactivateAllUserTokens(userId);
    }

    /**
     * Logout from specific device/session.
     *
     * @param tokenId Specific token ID to logout
     */
    @Transactional
    public void logoutFromDevice(Long tokenId) {
        userTokenRepository.findById(tokenId)
                .ifPresent(token -> {
                    token.setIsActive(false);
                    userTokenRepository.save(token);
                });
    }

    private void validateUserAndCompanyStatus(UserInfo user) {
        if (!user.getIsActive()) {
            throw new IllegalArgumentException("User account is disabled");
        }

        if (!user.getCompany().getIsActive()) {
            throw new IllegalArgumentException("Company account is disabled");
        }
    }

    private void incrementFailedAttempts(UserAuth userAuth) {
        userAuth.setFailedAttempts(userAuth.getFailedAttempts() + 1);
        userAuthRepository.save(userAuth);
    }

    private void resetFailedAttempts(UserAuth userAuth) {
        if (userAuth.getFailedAttempts() > 0) {
            userAuth.setFailedAttempts(0);
            userAuthRepository.save(userAuth);
        }
    }

    private AuthResponse generateAuthResponse(UserInfo user, String deviceInfo) {
        String jti = UUID.randomUUID().toString();
        String accessToken = jwtUtil.generateToken(
                user.getId(),
                user.getCompany().getId(),
                user.getUsername(),
                user.getRole().toString());
        String refreshToken = jwtUtil.generateRefreshToken(user.getId(), jti);
        String refreshTokenHash = hashRefreshToken(refreshToken);

        // Save refresh token
        UserToken token = new UserToken();
        token.setUser(user);
        token.setRefreshTokenHash(refreshTokenHash);
        token.setExpiresAt(LocalDateTime.now().plusSeconds(jwtUtil.getAccessTokenExpiration() * 7));
        token.setDeviceInfo(deviceInfo);
        token.setDeviceType(UserToken.DeviceType.web);
        token.setIsActive(true);
        userTokenRepository.save(token);

        // Build response
        AuthResponse.UserInfo userInfo = new AuthResponse.UserInfo(
                user.getId(),
                user.getCompany().getId(),
                user.getCompany().getName(),
                user.getUsername(),
                user.getEmail(),
                user.getFullName(),
                user.getRole().toString());

        return new AuthResponse(accessToken, refreshToken, "Bearer", jwtUtil.getAccessTokenExpiration(), userInfo);
    }

    /**
     * Hashes refresh token using SHA-256 for secure storage.
     */
    private String hashRefreshToken(String refreshToken) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(refreshToken.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }
}