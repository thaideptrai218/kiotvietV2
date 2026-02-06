package fa.academy.kiotviet.core.systemadmin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for company list in system admin panel
 * Contains company summary information for cross-tenant management
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemAdminCompanyListDTO {

    private Long id;
    private String name;
    private String email;
    private String phone;
    private String address;
    private Boolean isActive;
    private Boolean isSuspended;
    private Long userCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
