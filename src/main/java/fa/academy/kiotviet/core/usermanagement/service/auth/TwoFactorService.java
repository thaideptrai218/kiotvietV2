package fa.academy.kiotviet.core.usermanagement.service.auth;
import fa.academy.kiotviet.core.usermanagement.domain.UserAuth;
import fa.academy.kiotviet.core.usermanagement.domain.UserInfo;
import fa.academy.kiotviet.core.usermanagement.repository.UserAuthRepository;
import fa.academy.kiotviet.core.usermanagement.repository.UserInfoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.SimpleMailMessage;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class TwoFactorService {

    private final UserInfoRepository userInfoRepository;
    private final UserAuthRepository userAuthRepository;
    private final ObjectProvider<JavaMailSender> mailSenderProvider;

    @Value("${app.mail.from:}")
    private String fromAddress;

    private static class PendingCode {
        final String phone;
        final String code;
        final Instant expiresAt;
        PendingCode(String phone, String code, Instant expiresAt) {
            this.phone = phone; this.code = code; this.expiresAt = expiresAt;
        }
    }

    private final Map<Long, PendingCode> pending = new ConcurrentHashMap<>();
    private final Random random = new Random();
    private final Map<String, PendingCode> loginChallenges = new ConcurrentHashMap<>();
    private final Map<String, Long> challengeToUser = new ConcurrentHashMap<>();

    public void sendSetupCodeEmail(Long userId) {
        Optional<UserInfo> userOpt = userInfoRepository.findById(userId);
        if (userOpt.isEmpty()) return;
        UserInfo user = userOpt.get();
        String to = user.getEmail();
        if (to == null || to.isBlank()) return;
        String code = String.format("%06d", random.nextInt(1_000_000));
        pending.put(userId, new PendingCode(to, code, Instant.now().plusSeconds(300)));
        sendEmail(to, "Your Kiotviet verification code", "Your verification code is: " + code + "\nThis code expires in 5 minutes.");
    }

    public boolean verifySetupCode(Long userId, String code) {
        PendingCode p = pending.get(userId);
        if (p == null) return false;
        if (Instant.now().isAfter(p.expiresAt)) { pending.remove(userId); return false; }
        if (!p.code.equals(code)) return false;

        Optional<UserInfo> userOpt = userInfoRepository.findById(userId);
        if (userOpt.isEmpty()) return false;
        UserInfo user = userOpt.get();
        // for email-based 2FA, no need to change phone
        userInfoRepository.save(user);

        UserAuth auth = userAuthRepository.findByUserId(userId).orElse(null);
        if (auth == null) return false;
        auth.setTwoFactorEnabled(true);
        // store email as secret placeholder for now
        auth.setTwoFactorSecret(user.getEmail());
        userAuthRepository.save(auth);

        pending.remove(userId);
        return true;
    }

    // ===== Login MFA (every login) =====
    public String startLoginChallenge(Long userId) {
        Optional<UserInfo> userOpt = userInfoRepository.findById(userId);
        if (userOpt.isEmpty()) return null;
        UserInfo user = userOpt.get();
        String to = user.getEmail();
        if (to == null || to.isBlank()) return null;
        String code = String.format("%06d", random.nextInt(1_000_000));
        String challengeId = java.util.UUID.randomUUID().toString();
        loginChallenges.put(challengeId, new PendingCode(to, code, Instant.now().plusSeconds(300)));
        challengeToUser.put(challengeId, userId);
        sendEmail(to, "Your Kiotviet login code", "Your login verification code is: " + code + "\nThis code expires in 5 minutes.");
        return challengeId;
    }

    public Long verifyLoginCode(String challengeId, String code) {
        PendingCode p = loginChallenges.get(challengeId);
        if (p == null) return null;
        if (Instant.now().isAfter(p.expiresAt)) { cleanupChallenge(challengeId); return null; }
        if (!p.code.equals(code)) return null;
        Long userId = challengeToUser.get(challengeId);
        cleanupChallenge(challengeId);
        return userId;
    }

    public boolean resendLoginCode(String challengeId) {
        PendingCode p = loginChallenges.get(challengeId);
        Long userId = challengeToUser.get(challengeId);
        if (p == null || userId == null) return false;
        Optional<UserInfo> userOpt = userInfoRepository.findById(userId);
        if (userOpt.isEmpty()) return false;
        String to = userOpt.get().getEmail();
        sendEmail(to, "Your Kiotviet login code", "Your login verification code is: " + p.code + "\nThis code expires in 5 minutes.");
        return true;
    }

    private void cleanupChallenge(String challengeId) {
        loginChallenges.remove(challengeId);
        challengeToUser.remove(challengeId);
    }

    public boolean disable(Long userId) {
        Optional<UserAuth> authOpt = userAuthRepository.findByUserId(userId);
        if (authOpt.isEmpty()) return false;
        UserAuth auth = authOpt.get();
        auth.setTwoFactorEnabled(false);
        auth.setTwoFactorSecret(null);
        userAuthRepository.save(auth);
        pending.remove(userId);
        return true;
    }

    public boolean isEnabled(Long userId) {
        return userAuthRepository.findByUserId(userId)
                .map(UserAuth::getTwoFactorEnabled)
                .orElse(false);
    }

    public String maskedEmail(Long userId) {
        return userAuthRepository.findByUserId(userId)
                .map(UserAuth::getTwoFactorSecret)
                .map(this::maskEmail)
                .orElseGet(() -> userInfoRepository.findById(userId).map(UserInfo::getEmail).map(this::maskEmail).orElse(null));
    }

    private String maskEmail(String email) {
        if (email == null || email.isBlank() || !email.contains("@")) return email;
        String[] parts = email.split("@", 2);
        String local = parts[0];
        String domain = parts[1];
        String maskedLocal = local.length() <= 2 ? local.charAt(0) + "*" : local.substring(0, 2) + "***";
        return maskedLocal + "@" + domain;
    }

    private void sendEmail(String to, String subject, String body) {
        JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
        if (mailSender != null) {
            try {
                SimpleMailMessage message = new SimpleMailMessage();
                message.setTo(to);
                message.setSubject(subject);
                message.setText(body);
                if (fromAddress != null && !fromAddress.isBlank()) {
                    message.setFrom(fromAddress);
                }
                mailSender.send(message);
            } catch (Exception ignored) { }
        }
        // Always log for development visibility
        System.out.println("[EMAIL] to " + to + " => " + body.replace('\n',' '));
    }
}
