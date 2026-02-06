package fa.academy.kiotviet.core.systemadmin.dto;

import fa.academy.kiotviet.core.usermanagement.domain.UserInfo;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for creating a new user in system admin panel
 * Used by system admins to create users across any tenant
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemAdminUserCreateDTO {

    @NotNull(message = "Company ID is required")
    private Long companyId;

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 100, message = "Username must be between 3 and 100 characters")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Username can only contain letters, numbers, and underscores")
    private String username;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Size(max = 255, message = "Email must not exceed 255 characters")
    private String email;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 100, message = "Password must be between 8 and 100 characters")
    private String password;

    @Size(max = 255, message = "Full name must not exceed 255 characters")
    private String fullName;

    @Pattern(regexp = "^[0-9\\-\\+\\s()]*$", message = "Invalid phone format")
    @Size(max = 20, message = "Phone must not exceed 20 characters")
    private String phone;

    @NotNull(message = "Role is required")
    private UserInfo.UserRole role;

    @NotNull(message = "Active status is required")
    private Boolean isActive;
}
