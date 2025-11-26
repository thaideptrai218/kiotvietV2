package fa.academy.kiotviet.core.inventorycount.domain;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ForeignKey;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Entity
@Table(name = "inventory_count_items",
        indexes = {
                @Index(name = "idx_inventory_count_items_company", columnList = "company_id"),
                @Index(name = "idx_inventory_count_items_product", columnList = "product_id")
        })
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryCountItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inventory_count_id", nullable = false, foreignKey = @ForeignKey(name = "fk_inventory_item_parent"))
    private InventoryCount inventoryCount;

    @Column(name = "product_id", nullable = false)
    private Long productId;

    @Column(name = "product_number", nullable = false, length = 100)
    private String productNumber;

    @Column(name = "product_name", nullable = false, length = 255)
    private String productName;

    @Column(name = "unit", length = 100)
    private String unit;

    @Column(name = "on_hand", nullable = false)
    private Integer onHand;

    @Column(name = "counted", nullable = false)
    private Integer counted;

    @Column(name = "diff_qty", nullable = false)
    @Builder.Default
    private Integer diffQty = 0;

    @Column(name = "diff_cost", nullable = false, precision = 19, scale = 2)
    @Builder.Default
    private BigDecimal diffCost = BigDecimal.ZERO;

    @Column(name = "company_id", nullable = false)
    private Long companyId;
}

