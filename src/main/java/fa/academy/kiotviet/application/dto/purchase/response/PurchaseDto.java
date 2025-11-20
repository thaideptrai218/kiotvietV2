package fa.academy.kiotviet.application.dto.purchase.response;

import fa.academy.kiotviet.core.purchase.domain.PurchaseEntry;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseDto {
    private Long id;
    private String code;
    private Long supplierId;
    private String supplierName;
    private PurchaseEntry.Status status;
    private LocalDate billDate;
    private LocalDate dueDate;
    private String referenceNo;
    private String notes;
    private String currency;

    private BigDecimal subtotal;
    private BigDecimal discountTotal;
    private BigDecimal taxTotal;
    private BigDecimal supplierExpense;
    private BigDecimal otherExpense;
    private BigDecimal grandTotal;
    private BigDecimal amountPaid;
    private BigDecimal amountDue;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private List<PurchaseLineDto> lines;
    private List<PurchasePaymentDto> payments;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PurchaseLineDto {
        private Long id;
        private Long productId;
        private String productName;
        private String description;
        private Integer qtyOrdered;
        private Integer qtyReceived;
        private BigDecimal unitCost;
        private BigDecimal discountAmount;
        private BigDecimal taxPercent;
        private BigDecimal lineTotal;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PurchasePaymentDto {
        private Long id;
        private java.time.LocalDateTime paidAt;
        private String method;
        private BigDecimal amount;
        private String reference;
        private String note;
    }
}

