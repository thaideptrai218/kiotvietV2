package fa.academy.kiotviet.core.systemadmin.dto;

import fa.academy.kiotviet.core.usermanagement.domain.UserInfo;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for user list in system admin panel
 * Contains user information across all tenants for cross-tenant management
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemAdminUserListDTO {

    private Long id;
    private String username;
    private String email;
    private String fullName;
    private String phone;
    private UserInfo.UserRole role;
    private String companyName;
    private Long companyId;
    private Boolean isActive;
    private LocalDateTime lastLoginAt;
    private LocalDateTime createdAt;
}
