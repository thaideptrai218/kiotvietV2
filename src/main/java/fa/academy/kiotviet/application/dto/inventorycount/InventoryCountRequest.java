package fa.academy.kiotviet.application.dto.inventorycount;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryCountRequest {

    @Size(max = 20, message = "Code must not exceed 20 characters")
    private String code;

    @Size(max = 1000, message = "Note must not exceed 1000 characters")
    private String note;

    @NotEmpty(message = "Inventory count must contain at least one item")
    @Valid
    private List<InventoryCountItemRequest> items;
}

