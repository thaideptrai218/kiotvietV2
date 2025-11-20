package fa.academy.kiotviet.application.dto.purchase.request;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class PurchaseCreateRequest {
    private Long supplierId;
    private LocalDate billDate;
    private LocalDate dueDate;
    private String referenceNo;
    private String notes;

    private BigDecimal discountTotal = BigDecimal.ZERO;   // header-level discount
    private BigDecimal supplierExpense = BigDecimal.ZERO;
    private BigDecimal otherExpense = BigDecimal.ZERO;
    private BigDecimal amountPaid = BigDecimal.ZERO;      // initial payment at creation

    private List<PurchaseLineRequest> lines;
}

