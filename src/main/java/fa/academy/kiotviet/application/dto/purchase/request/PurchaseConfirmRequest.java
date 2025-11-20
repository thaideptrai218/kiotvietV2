package fa.academy.kiotviet.application.dto.purchase.request;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class PurchaseConfirmRequest {
    private BigDecimal amountPaid = BigDecimal.ZERO;
    private String paymentMethod;  // CASH/BANK/OTHER
    private String reference;
}

