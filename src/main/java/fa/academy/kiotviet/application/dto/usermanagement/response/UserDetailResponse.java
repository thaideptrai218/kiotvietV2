package fa.academy.kiotviet.application.dto.usermanagement.response;

import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserDetailResponse {
    private Long id;
    private String displayName;
    private String username;
    private String email;
    private String phone;
    private String role;
    private String status;
    private LocalDate birthday;
    private String address;
    private String note;
    private java.util.List<String> permissions;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
