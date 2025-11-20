package fa.academy.kiotviet.application.dto.orders.request;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class OrderCreateRequest {
    private String customerName;
    private String phoneNumber;
    private String paymentMethod; // CASH, TRANSFER, COD, CARD, OTHER
    private BigDecimal paidAmount; // optional
    private List<OrderCreateItem> items;
}

