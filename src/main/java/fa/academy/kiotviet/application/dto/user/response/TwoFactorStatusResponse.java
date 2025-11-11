package fa.academy.kiotviet.application.dto.user.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class TwoFactorStatusResponse {
    private boolean enabled;
    private String email; // masked email for display
}
