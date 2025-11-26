package fa.academy.kiotviet.application.dto.inventorycount;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryCountUpdateRequest {

    @Size(max = 1000, message = "Note must not exceed 1000 characters")
    private String note;
}

