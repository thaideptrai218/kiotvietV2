package fa.academy.kiotviet.application.dto.usermanagement.response;

import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserPageResponse {
    private List<UserListItemResponse> content;
    private long totalElements;
    private int totalPages;
    private int page;
    private int size;
}
