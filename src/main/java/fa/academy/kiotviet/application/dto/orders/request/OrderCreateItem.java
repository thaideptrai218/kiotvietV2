package fa.academy.kiotviet.application.dto.orders.request;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class OrderCreateItem {
    private Long productId;       // optional
    private String sku;           // fallback if no productId
    private String name;          // display name
    private Integer quantity;     // required >= 1
    private BigDecimal unitPrice; // required >= 0
    private BigDecimal discount;  // optional, default 0
}

