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
    private BigDecimal orderDiscount; // optional absolute discount (VND)
    private BigDecimal orderDiscountPercent; // optional percentage discount (0-100)
    private String note; // optional order note
    private String cashier; // username of creator/cashier
    private List<OrderCreateItem> items;
}
