package fa.academy.kiotviet.application.dto.inventorycount;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MergeInventoryResponse {
    private Long newInventoryId;
    private boolean success;
}

