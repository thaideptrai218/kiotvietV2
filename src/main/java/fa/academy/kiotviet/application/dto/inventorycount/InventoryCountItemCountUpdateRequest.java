package fa.academy.kiotviet.application.dto.inventorycount;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryCountItemCountUpdateRequest {

    @NotNull(message = "Counted quantity is required")
    @Min(value = 0, message = "Counted quantity cannot be negative")
    private Integer counted;
}

