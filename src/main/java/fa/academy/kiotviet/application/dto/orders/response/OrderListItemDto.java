package fa.academy.kiotviet.application.dto.orders.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderListItemDto {
    private Long id;
    private String orderCode;
    private LocalDateTime orderDate;
    private String customerName;
    private String phoneNumber;
    private BigDecimal subtotal;
    private BigDecimal discount;
    private BigDecimal paidAmount;
    private BigDecimal totalAmount;
    private String paymentMethod;
    private String cashier;
    private String status;
}
