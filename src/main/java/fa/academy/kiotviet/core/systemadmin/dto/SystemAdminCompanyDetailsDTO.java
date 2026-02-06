package fa.academy.kiotviet.core.systemadmin.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO for detailed company information in system admin panel
 * Contains complete company details for management operations
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemAdminCompanyDetailsDTO {

    private Long id;
    private String name;
    private String email;
    private String phone;
    private String address;
    private String country;
    private String province;
    private String ward;
    private String taxCode;
    private String logoUrl;
    private Boolean isActive;
    private Boolean isSuspended;
    private Long userCount;
    private Long activeUserCount;
    private Long productCount;
    private Long orderCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
