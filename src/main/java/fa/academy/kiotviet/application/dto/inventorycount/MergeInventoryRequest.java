package fa.academy.kiotviet.application.dto.inventorycount;

import jakarta.validation.constraints.NotEmpty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MergeInventoryRequest {

    @NotEmpty(message = "At least one inventory id is required")
    private List<Long> ids;
}

