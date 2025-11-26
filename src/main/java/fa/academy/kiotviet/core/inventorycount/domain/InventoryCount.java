package fa.academy.kiotviet.core.inventorycount.domain;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "inventory_counts",
        uniqueConstraints = @UniqueConstraint(name = "uk_inventory_count_company_code", columnNames = {"company_id", "code"}),
        indexes = {
                @Index(name = "idx_inventory_counts_company", columnList = "company_id"),
                @Index(name = "idx_inventory_counts_code", columnList = "code"),
                @Index(name = "idx_inventory_counts_created_at", columnList = "created_at")
        })
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryCount {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "code", nullable = false, length = 20)
    private String code;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @Column(name = "created_by", nullable = false)
    private Long createdBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private InventoryCountStatus status = InventoryCountStatus.DRAFT;

    @Column(name = "total_on_hand", nullable = false)
    @Builder.Default
    private Integer totalOnHand = 0;

    @Column(name = "total_actual_count", nullable = false)
    @Builder.Default
    private Integer totalActualCount = 0;

    @Column(name = "total_surplus", nullable = false)
    @Builder.Default
    private Integer totalSurplus = 0;

    @Column(name = "total_missing", nullable = false)
    @Builder.Default
    private Integer totalMissing = 0;

    @Column(name = "total_diff_qty", nullable = false)
    @Builder.Default
    private Integer totalDiffQty = 0;

    @Column(name = "total_price_actual", nullable = false, precision = 19, scale = 2)
    @Builder.Default
    private BigDecimal totalPriceActual = BigDecimal.ZERO;

    @Column(name = "note", length = 1000)
    private String note;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    @Column(name = "merged_into")
    private Long mergedInto;

    @OneToMany(mappedBy = "inventoryCount", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id ASC")
    @Builder.Default
    private List<InventoryCountItem> items = new ArrayList<>();

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (status == null) {
            status = InventoryCountStatus.DRAFT;
        }
        if (totalPriceActual == null) {
            totalPriceActual = BigDecimal.ZERO;
        }
    }

    public void addItem(InventoryCountItem item) {
        item.setInventoryCount(this);
        this.items.add(item);
    }

    public void removeItem(InventoryCountItem item) {
        item.setInventoryCount(null);
        this.items.remove(item);
    }
}
