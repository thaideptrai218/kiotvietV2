package fa.academy.kiotviet.core.suppliers.domain;

import fa.academy.kiotviet.core.tenant.domain.Company;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.math.BigDecimal;

@Entity
@Table(name = "suppliers",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_company_name", columnNames = {"company_id", "name"}),
        @UniqueConstraint(name = "uk_company_tax_code", columnNames = {"company_id", "tax_code"})
    },
    indexes = {
        @Index(name = "idx_company_name", columnList = "company_id,name"),
        @Index(name = "idx_company_active", columnList = "company_id,is_active"),
        @Index(name = "idx_contact_person", columnList = "contact_person"),
        @Index(name = "idx_tax_code", columnList = "tax_code")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Supplier {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false, foreignKey = @ForeignKey(name = "fk_supplier_company"))
    private Company company;

    @NotBlank
    @Size(max = 255)
    @Column(name = "name", nullable = false)
    private String name;

    @Size(max = 255)
    @Column(name = "contact_person")
    private String contactPerson;

    @Pattern(regexp = "^[0-9\\-\\+\\s()]*$", message = "Invalid phone format")
    @Size(max = 20)
    @Column(name = "phone")
    private String phone;

    @Email
    @Size(max = 255)
    @Column(name = "email")
    private String email;

    @Column(name = "address", columnDefinition = "TEXT")
    private String address;

    @Size(max = 50)
    @Column(name = "tax_code")
    private String taxCode;

    @Size(max = 255)
    @Column(name = "website")
    private String website;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "outstanding_balance", precision = 15, scale = 2)
    private BigDecimal outstandingBalance;

    @Column(name = "last_payment_date")
    private LocalDateTime lastPaymentDate;

    @Column(name = "credit_limit", precision = 15, scale = 2)
    private BigDecimal creditLimit;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
