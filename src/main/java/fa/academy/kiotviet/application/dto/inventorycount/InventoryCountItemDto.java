package fa.academy.kiotviet.application.dto.inventorycount;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class InventoryCountItemDto {

    private Long id;
    private Long productId;
    private String productNumber;
    private String productName;
    private String unit;
    private Integer onHand;
    private Integer counted;
    private Integer diffQty;
    private BigDecimal diffCost;
}

