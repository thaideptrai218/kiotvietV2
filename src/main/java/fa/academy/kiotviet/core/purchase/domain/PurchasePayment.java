package fa.academy.kiotviet.core.purchase.domain;

import fa.academy.kiotviet.core.tenant.domain.Company;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "purchase_payments",
        indexes = {
                @Index(name = "idx_payment_entry_paid_at", columnList = "purchase_entry_id,paid_at"),
                @Index(name = "idx_company_paid_at", columnList = "company_id,paid_at")
        }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchasePayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false, foreignKey = @ForeignKey(name = "fk_purch_payment_company"))
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_entry_id", nullable = false, foreignKey = @ForeignKey(name = "fk_purch_payment_entry"))
    private PurchaseEntry purchaseEntry;

    @Column(name = "paid_at", nullable = false)
    @Builder.Default
    private LocalDateTime paidAt = LocalDateTime.now();

    @Column(name = "method", length = 50)
    @Builder.Default
    private String method = "CASH";

    @Column(name = "amount", precision = 15, scale = 2, nullable = false)
    private BigDecimal amount;

    @Column(name = "reference", length = 100)
    private String reference;

    @Column(name = "note", length = 255)
    private String note;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
    }
}

