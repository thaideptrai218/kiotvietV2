package fa.academy.kiotviet.application.dto.purchase.request;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class PurchasePaymentRequest {
    private BigDecimal amount;
    private String method;
    private String reference;
    private String note;
}

