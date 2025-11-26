package fa.academy.kiotviet.application.dto.inventorycount;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryCountItemRequest {

    @NotNull(message = "Product ID is required")
    private Long productId;

    @NotBlank(message = "Product number is required")
    @Size(max = 100, message = "Product number must not exceed 100 characters")
    private String productNumber;

    @NotBlank(message = "Product name is required")
    @Size(max = 255, message = "Product name must not exceed 255 characters")
    private String productName;

    @Size(max = 100, message = "Unit must not exceed 100 characters")
    private String unit;

    @NotNull(message = "On hand quantity is required")
    @Min(value = 0, message = "On hand quantity cannot be negative")
    private Integer onHand;

    @NotNull(message = "Counted quantity is required")
    @Min(value = 0, message = "Counted quantity cannot be negative")
    private Integer counted;
}

