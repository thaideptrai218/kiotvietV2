package fa.academy.kiotviet.application.dto.purchase.request;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class PurchaseLineRequest {
    private Long id;                 // present when updating existing line
    private Long productId;
    private Integer qtyOrdered;
    private BigDecimal unitCost;
    private BigDecimal discountAmount;
    private BigDecimal taxPercent;
    private String description;
}

