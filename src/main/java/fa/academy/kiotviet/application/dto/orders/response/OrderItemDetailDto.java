package fa.academy.kiotviet.application.dto.orders.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderItemDetailDto {
    private String productCode;
    private String productName;
    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal discount; // per item
    private BigDecimal salePrice; // unitPrice - discount
    private BigDecimal total; // salePrice * qty
}

