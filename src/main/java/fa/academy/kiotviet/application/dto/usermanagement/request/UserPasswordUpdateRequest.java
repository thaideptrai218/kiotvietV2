package fa.academy.kiotviet.application.dto.usermanagement.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UserPasswordUpdateRequest {

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 128, message = "Password must be between 8 and 128 characters")
    @Pattern(regexp = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&()\\-+_=#])[A-Za-z\\d@$!%*?&()\\-+_=#]{8,}$",
        message = "Password must contain uppercase, lowercase, digit, and special character")
    private String password;
}
