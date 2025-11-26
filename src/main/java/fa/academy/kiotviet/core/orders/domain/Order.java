package fa.academy.kiotviet.core.orders.domain;

import fa.academy.kiotviet.core.tenant.domain.Company;
import jakarta.persistence.*;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "orders",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_company_order_code", columnNames = {"company_id", "order_code"})
        },
        indexes = {
                @Index(name = "idx_company_date", columnList = "company_id,order_date"),
                @Index(name = "idx_company_status", columnList = "company_id,status"),
                @Index(name = "idx_company_customer", columnList = "company_id,customer_name"),
                @Index(name = "idx_company_phone", columnList = "company_id,phone_number")
        }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false, foreignKey = @ForeignKey(name = "fk_order_company"))
    private Company company;

    @Column(name = "order_code", nullable = false, length = 50)
    private String orderCode;

    @Column(name = "order_date", nullable = false)
    private LocalDateTime orderDate;

    @Size(max = 255)
    @Column(name = "customer_name")
    private String customerName;

    @Size(max = 20)
    @Column(name = "phone_number")
    private String phoneNumber;

    @NotNull
    @Digits(integer = 10, fraction = 2)
    @Column(name = "subtotal", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal subtotal = BigDecimal.ZERO;

    @NotNull
    @Digits(integer = 10, fraction = 2)
    @Column(name = "discount", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal discount = BigDecimal.ZERO;

    @NotNull
    @Digits(integer = 10, fraction = 2)
    @Column(name = "paid_amount", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal paidAmount = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_method")
    @Builder.Default
    private PaymentMethod paymentMethod = PaymentMethod.CASH;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    @Builder.Default
    private OrderStatus status = OrderStatus.DRAFT;

    @Column(name = "cashier")
    private String cashier;

    @Column(name = "note", length = 1024)
    private String note;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (orderDate == null) orderDate = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum OrderStatus {
        DRAFT, COMPLETED, SHIPPING, CANCELLED
    }

    public enum PaymentMethod {
        CASH, TRANSFER, COD, CARD, OTHER
    }
}

