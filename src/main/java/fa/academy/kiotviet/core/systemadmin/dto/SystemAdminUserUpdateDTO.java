package fa.academy.kiotviet.core.systemadmin.dto;

import fa.academy.kiotviet.core.usermanagement.domain.UserInfo;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for updating a user in system admin panel
 * Used by system admins to update users across any tenant
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemAdminUserUpdateDTO {

    @Email(message = "Invalid email format")
    @Size(max = 255, message = "Email must not exceed 255 characters")
    private String email;

    @Size(max = 255, message = "Full name must not exceed 255 characters")
    private String fullName;

    @Pattern(regexp = "^[0-9\\-\\+\\s()]*$", message = "Invalid phone format")
    @Size(max = 20, message = "Phone must not exceed 20 characters")
    private String phone;

    @Size(max = 1000, message = "Address must not exceed 1000 characters")
    private String address;

    private String note;

    @NotNull(message = "Role is required")
    private UserInfo.UserRole role;

    @NotNull(message = "Active status is required")
    private Boolean isActive;
}
