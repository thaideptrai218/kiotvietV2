package fa.academy.kiotviet.core.purchase.domain;

import fa.academy.kiotviet.core.suppliers.domain.Supplier;
import fa.academy.kiotviet.core.tenant.domain.Company;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "purchase_entries",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_company_code", columnNames = {"company_id", "code"})
        },
        indexes = {
                @Index(name = "idx_company_status_date", columnList = "company_id,status,bill_date"),
                @Index(name = "idx_company_supplier_date", columnList = "company_id,supplier_id,bill_date"),
                @Index(name = "idx_company_code", columnList = "company_id,code")
        }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false, foreignKey = @ForeignKey(name = "fk_purchase_entry_company"))
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id", nullable = false, foreignKey = @ForeignKey(name = "fk_purchase_entry_supplier"))
    private Supplier supplier;

    @Column(name = "code", length = 50)
    private String code;

    public enum Status { DRAFT, CONFIRMED, PARTIALLY_RECEIVED, RECEIVED, CANCELLED }

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private Status status = Status.DRAFT;

    @Column(name = "bill_date", nullable = false)
    private LocalDate billDate;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "reference_no", length = 100)
    private String referenceNo;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "currency", length = 10)
    @Builder.Default
    private String currency = "VND";

    @Column(name = "subtotal", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal subtotal = BigDecimal.ZERO;

    @Column(name = "discount_total", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal discountTotal = BigDecimal.ZERO;

    @Column(name = "tax_total", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal taxTotal = BigDecimal.ZERO;

    @Column(name = "supplier_expense", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal supplierExpense = BigDecimal.ZERO;

    @Column(name = "other_expense", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal otherExpense = BigDecimal.ZERO;

    @Column(name = "grand_total", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal grandTotal = BigDecimal.ZERO;

    @Column(name = "amount_paid", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal amountPaid = BigDecimal.ZERO;

    @Column(name = "amount_due", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal amountDue = BigDecimal.ZERO;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "purchaseEntry", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PurchaseEntryLine> lines = new ArrayList<>();

    @OneToMany(mappedBy = "purchaseEntry", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<PurchasePayment> payments = new ArrayList<>();

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public boolean isAnyReceived() {
        return lines != null && lines.stream().anyMatch(l -> l.getQtyReceived() != null && l.getQtyReceived() > 0);
    }

    public boolean isFullyReceived() {
        return lines != null && !lines.isEmpty() && lines.stream().allMatch(l ->
                (l.getQtyReceived() != null ? l.getQtyReceived() : 0) >= (l.getQtyOrdered() != null ? l.getQtyOrdered() : 0)
        );
    }
}

