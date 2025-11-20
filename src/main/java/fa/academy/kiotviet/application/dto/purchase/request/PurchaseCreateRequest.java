package fa.academy.kiotviet.application.dto.purchase.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class PurchaseCreateRequest {
    @NotNull
    private Long supplierId;

    private LocalDate billDate;
    private LocalDate dueDate;
    private String referenceNo;
    private String notes;

    @DecimalMin(value = "0.0", inclusive = true, message = "discountTotal cannot be negative")
    private BigDecimal discountTotal = BigDecimal.ZERO;   // header-level discount

    @DecimalMin(value = "0.0", inclusive = true, message = "supplierExpense cannot be negative")
    private BigDecimal supplierExpense = BigDecimal.ZERO;

    @DecimalMin(value = "0.0", inclusive = true, message = "otherExpense cannot be negative")
    private BigDecimal otherExpense = BigDecimal.ZERO;

    @DecimalMin(value = "0.0", inclusive = true, message = "amountPaid cannot be negative")
    private BigDecimal amountPaid = BigDecimal.ZERO;      // initial payment at creation

    @Valid
    private List<PurchaseLineRequest> lines;
}
