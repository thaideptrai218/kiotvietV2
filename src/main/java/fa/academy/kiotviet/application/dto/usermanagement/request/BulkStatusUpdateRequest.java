package fa.academy.kiotviet.application.dto.usermanagement.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;
import lombok.Data;

@Data
public class BulkStatusUpdateRequest {

    @NotEmpty(message = "Ids are required")
    private List<Long> ids;

    @NotNull(message = "Status is required")
    private String status;
}
