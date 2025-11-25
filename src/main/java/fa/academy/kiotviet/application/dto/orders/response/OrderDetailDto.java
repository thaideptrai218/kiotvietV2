package fa.academy.kiotviet.application.dto.orders.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OrderDetailDto {
    private Long id;
    private String orderCode;
    private LocalDateTime orderDate;
    private String customerName;
    private String phoneNumber;
    private String status;
    private String paymentMethod;
    private String branchName;
    private String creator;
    private String seller;

    private BigDecimal subtotal;
    private BigDecimal discountPercent;
    private BigDecimal discountAmount;
    private BigDecimal total;
    private BigDecimal customerPays;
    private BigDecimal remainingAmount;
    private BigDecimal paidAmount;

    private List<OrderItemDetailDto> items;
}

