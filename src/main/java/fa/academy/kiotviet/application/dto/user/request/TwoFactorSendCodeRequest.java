package fa.academy.kiotviet.application.dto.user.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class TwoFactorSendCodeRequest {
    @NotBlank(message = "Phone is required")
    // Accept digits, spaces, plus, parentheses, and hyphen
    @Pattern(regexp = "^[\\d\\s()+-]*$", message = "Invalid phone format")
    @Size(max = 20, message = "Phone must not exceed 20 characters")
    private String phone;
}

