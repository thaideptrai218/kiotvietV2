package fa.academy.kiotviet.application.dto.purchase.request;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class PurchaseUpdateRequest {
    private String notes;
    private BigDecimal discountTotal;     // header-level discount (optional)
    private BigDecimal supplierExpense;
    private BigDecimal otherExpense;
    private List<PurchaseLineRequest> lines; // include id for updates; omit id for new lines
}

