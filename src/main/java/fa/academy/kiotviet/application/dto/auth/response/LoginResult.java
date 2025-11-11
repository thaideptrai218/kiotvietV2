package fa.academy.kiotviet.application.dto.auth.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResult {
    private boolean mfaRequired;
    private AuthResponse auth;
    private String challengeId;

    public static LoginResult mfa(String challengeId) {
        return new LoginResult(true, null, challengeId);
    }

    public static LoginResult success(AuthResponse auth) {
        return new LoginResult(false, auth, null);
    }
}

