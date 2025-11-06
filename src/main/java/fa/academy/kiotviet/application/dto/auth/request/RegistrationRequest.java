package fa.academy.kiotviet.application.dto.auth.request;

import fa.academy.kiotviet.core.usermanagement.domain.UserInfo.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegistrationRequest {

    @NotBlank(message = "Company name is required")
    @Size(min = 2, max = 255, message = "Company name must be between 2 and 255 characters")
    private String companyName;

    @Email(message = "Invalid company email format")
    @Size(max = 255, message = "Company email must not exceed 255 characters")
    private String companyEmail;

    @Pattern(regexp = "^[0-9\\-\\+\\s()]*$", message = "Invalid phone format")
    @Size(max = 20, message = "Company phone must not exceed 20 characters")
    private String companyPhone;

    @Size(max = 1000, message = "Company address must not exceed 1000 characters")
    private String companyAddress;

    @Size(max = 50, message = "Tax code must not exceed 50 characters")
    private String taxCode;

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 100, message = "Username must be between 3 and 100 characters")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Username can only contain letters, numbers, and underscores")
    private String username;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Size(max = 255, message = "Email must not exceed 255 characters")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 128, message = "Password must be between 8 and 128 characters")
    // @Pattern(regexp = "^(?=.*[A-Za-z])(?=.*\\d)[A-Za-z\\d]{8,}$", message = "Password must contain at least one uppercase letter, one lowercase letter, one digit, and one special character")
    private String password;

    @Size(max = 255, message = "Full name must not exceed 255 characters")
    private String fullName;

    @Pattern(regexp = "^[0-9\\-\\+\\s()]*$", message = "Invalid phone format")
    @Size(max = 20, message = "Phone must not exceed 20 characters")
    private String phone;

    private UserRole role = UserRole.admin;
}