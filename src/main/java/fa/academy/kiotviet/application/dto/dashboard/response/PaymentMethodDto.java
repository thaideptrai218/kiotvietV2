package fa.academy.kiotviet.application.dto.dashboard.response;

import fa.academy.kiotviet.core.orders.domain.Order.PaymentMethod;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentMethodDto {
    private PaymentMethod paymentMethod;
    private String paymentMethodLabel;
    private Long transactionCount;
    private BigDecimal totalAmount;
    private Double percentageOfTotal;
    private BigDecimal averageTransactionValue;
}