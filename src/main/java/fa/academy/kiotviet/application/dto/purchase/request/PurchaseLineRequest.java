package fa.academy.kiotviet.application.dto.purchase.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PurchaseLineRequest {
    private Long id;                 // present when updating existing line

    @NotNull
    private Long productId;

    @NotNull
    @Min(value = 1, message = "qtyOrdered must be at least 1")
    private Integer qtyOrdered;

    @NotNull
    @DecimalMin(value = "0.0", inclusive = false, message = "unitCost must be greater than 0")
    private BigDecimal unitCost;

    @DecimalMin(value = "0.0", inclusive = true, message = "discountAmount cannot be negative")
    private BigDecimal discountAmount;

    @DecimalMin(value = "0.0", inclusive = true, message = "taxPercent cannot be negative")
    private BigDecimal taxPercent;

    private String description;
}
