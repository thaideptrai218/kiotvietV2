package fa.academy.kiotviet.core.purchase.domain;

import fa.academy.kiotviet.core.productcatalog.domain.Product;
import fa.academy.kiotviet.core.tenant.domain.Company;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "purchase_entry_lines",
        indexes = {
                @Index(name = "idx_entry_lines_entry", columnList = "purchase_entry_id"),
                @Index(name = "idx_company_product", columnList = "company_id,product_id")
        }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseEntryLine {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false, foreignKey = @ForeignKey(name = "fk_purch_line_company"))
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "purchase_entry_id", nullable = false, foreignKey = @ForeignKey(name = "fk_purch_line_entry"))
    private PurchaseEntry purchaseEntry;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false, foreignKey = @ForeignKey(name = "fk_purch_line_product"))
    private Product product;

    @Column(name = "description", length = 255)
    private String description;

    @Column(name = "qty_ordered")
    @Builder.Default
    private Integer qtyOrdered = 0;

    @Column(name = "qty_received")
    @Builder.Default
    private Integer qtyReceived = 0;

    @Column(name = "unit_cost", precision = 12, scale = 2, nullable = false)
    private BigDecimal unitCost;

    @Column(name = "discount_amount", precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "discount_percent", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal discountPercent = BigDecimal.ZERO;

    @Column(name = "tax_percent", precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal taxPercent = BigDecimal.ZERO;

    @Column(name = "line_total", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal lineTotal = BigDecimal.ZERO;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        createdAt = LocalDateTime.now();
    }
}

