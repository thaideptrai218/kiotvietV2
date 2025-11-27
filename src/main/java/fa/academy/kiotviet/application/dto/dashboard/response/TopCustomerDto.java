package fa.academy.kiotviet.application.dto.dashboard.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TopCustomerDto {
    private String customerName;
    private String phoneNumber;
    private Long orderCount;
    private BigDecimal totalSpent;
    private BigDecimal averageOrderValue;
    private LocalDate lastOrderDate;
    private LocalDate firstOrderDate;
    private Long customerId;
}