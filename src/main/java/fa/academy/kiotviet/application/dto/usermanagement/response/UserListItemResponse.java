package fa.academy.kiotviet.application.dto.usermanagement.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserListItemResponse {
    private Long id;
    private String displayName;
    private String username;
    private String phone;
    private String role;
    private String status;
}
