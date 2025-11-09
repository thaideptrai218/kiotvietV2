package fa.academy.kiotviet.core.usermanagement.service.auth;

import fa.academy.kiotviet.application.dto.auth.request.ForgotPasswordRequest;
import fa.academy.kiotviet.application.dto.auth.request.ResetPasswordRequest;
import fa.academy.kiotviet.core.usermanagement.domain.PasswordResetToken;
import fa.academy.kiotviet.core.usermanagement.domain.UserAuth;
import fa.academy.kiotviet.core.usermanagement.domain.UserInfo;
import fa.academy.kiotviet.core.usermanagement.repository.PasswordResetTokenRepository;
import fa.academy.kiotviet.core.usermanagement.repository.UserAuthRepository;
import fa.academy.kiotviet.core.usermanagement.repository.UserInfoRepository;
import fa.academy.kiotviet.core.usermanagement.repository.UserTokenRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.SimpleMailMessage;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordResetService {

    private final UserInfoRepository userInfoRepository;
    private final UserAuthRepository userAuthRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final UserTokenRepository userTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    private static final long RESET_TOKEN_TTL_SECONDS = 1800; // 30 minutes

    @Transactional
    public void requestReset(ForgotPasswordRequest requestDto, HttpServletRequest httpRequest) {
        String identifier = requestDto.getUsername();

        Optional<UserInfo> userOpt = userInfoRepository.findByUsername(identifier)
                .filter(UserInfo::getIsActive);

        if (userOpt.isEmpty()) {
            userOpt = userInfoRepository.findByEmail(identifier)
                    .filter(UserInfo::getIsActive);
        }

        if (userOpt.isEmpty()) {
            log.info("Password reset requested for non-existing or inactive identifier: {}", identifier);
            return; // Always return success to avoid user enumeration
        }

        UserInfo user = userOpt.get();

        // Invalidate any previous unused tokens for this user
        passwordResetTokenRepository.deleteByUserAndIsUsedFalse(user);

        String token = generateToken();
        String tokenHash = hashToken(token);

        PasswordResetToken reset = new PasswordResetToken();
        reset.setUser(user);
        reset.setTokenHash(tokenHash);
        reset.setExpiresAt(LocalDateTime.now().plusSeconds(RESET_TOKEN_TTL_SECONDS));
        reset.setRequestedIp(getClientIp(httpRequest));
        reset.setUserAgent(httpRequest != null ? httpRequest.getHeader("User-Agent") : null);
        passwordResetTokenRepository.save(reset);

        String resetLink = buildAbsoluteResetLink(httpRequest, token);
        log.info("Password reset link for user {}: {}", identifier, resetLink);

        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender != null) {
            try {
                sendResetEmail(mailSender, user.getEmail(), user.getFullName() != null ? user.getFullName() : user.getUsername(), resetLink);
            } catch (Exception e) {
                log.warn("Failed to send reset email to {}: {}", user.getEmail(), e.getMessage());
            }
        } else {
            log.info("Mail sender not configured; only logging reset link.");
        }
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest requestDto) {
        String tokenHash = hashToken(requestDto.getToken());
        PasswordResetToken resetToken = passwordResetTokenRepository
                .findByTokenHashAndIsUsedFalseAndExpiresAtAfter(tokenHash, LocalDateTime.now())
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired reset token"));

        UserInfo user = resetToken.getUser();
        UserAuth userAuth = userAuthRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalStateException("User auth not found"));

        String newSalt = generateSalt();
        String newHash = passwordEncoder.encode(requestDto.getNewPassword() + newSalt);

        userAuth.setSalt(newSalt);
        userAuth.setPasswordHash(newHash);
        userAuth.setFailedAttempts(0);
        userAuthRepository.save(userAuth);

        // Mark token used
        resetToken.setIsUsed(true);
        resetToken.setUsedAt(LocalDateTime.now());
        passwordResetTokenRepository.save(resetToken);

        // Invalidate existing refresh tokens (logout everywhere)
        userTokenRepository.deactivateAllUserTokens(user.getId());
    }

    private String generateToken() {
        byte[] bytes = new byte[32];
        new SecureRandom().nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String generateSalt() {
        byte[] salt = new byte[16];
        new SecureRandom().nextBytes(salt);
        return Base64.getEncoder().encodeToString(salt);
    }

    private String hashToken(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(token.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(hash);
        } catch (Exception e) {
            throw new RuntimeException("SHA-256 algorithm not available", e);
        }
    }

    private String urlEncode(String s) {
        try {
            return java.net.URLEncoder.encode(s, java.nio.charset.StandardCharsets.UTF_8);
        } catch (Exception e) {
            return s;
        }
    }

    private String buildAbsoluteResetLink(HttpServletRequest request, String token) {
        String encodedToken = urlEncode(token);
        if (request == null) {
            return "/auth/reset?token=" + encodedToken;
        }
        String scheme = firstNonBlank(request.getHeader("X-Forwarded-Proto"), request.getScheme());
        String host = firstNonBlank(request.getHeader("X-Forwarded-Host"), request.getHeader("Host"));
        if (host == null || host.isBlank()) {
            host = request.getServerName() + (request.getServerPort() != 80 && request.getServerPort() != 443 ? ":" + request.getServerPort() : "");
        }
        return scheme + "://" + host + "/auth/reset?token=" + encodedToken;
    }

    private String firstNonBlank(String a, String b) {
        if (a != null && !a.isBlank()) return a;
        return b;
    }

    private void sendResetEmail(JavaMailSender mailSender, String to, String name, String link) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Reset your Kiotviet password");
        String greeting = (name != null && !name.isBlank()) ? ("Hi " + name + ",") : "Hello,";
        message.setText(greeting + "\n\n" +
                "We received a request to reset your password. " +
                "Click the link below to set a new password:\n\n" +
                link + "\n\n" +
                "If you did not request this, you can safely ignore this email. The link will expire in 30 minutes.\n\n" +
                "Thanks,\nKiotviet Team");
        mailSender.send(message);
    }

    private String getClientIp(HttpServletRequest request) {
        if (request == null) return null;
        String ip = request.getHeader("X-Forwarded-For");
        if (ip != null && !ip.isBlank()) {
            int comma = ip.indexOf(',');
            return comma > -1 ? ip.substring(0, comma).trim() : ip.trim();
        }
        return request.getRemoteAddr();
    }
}
