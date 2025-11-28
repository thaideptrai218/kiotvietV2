package fa.academy.kiotviet.core.customers.domain;

import fa.academy.kiotviet.core.tenant.domain.Company;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Customer entity for customer management.
 * Supports multi-tenant architecture with company-level isolation.
 */
@Entity
@Table(name = "customers",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_customers_account_code", columnNames = {"account_id", "code"})
    },
    indexes = {
        @Index(name = "idx_customers_account_phone", columnList = "account_id,phone"),
        @Index(name = "idx_customers_account_name", columnList = "account_id,name")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "account_id", nullable = false, foreignKey = @ForeignKey(name = "fk_customers_company"))
    private Company company;

    @Size(max = 50, message = "Code must not exceed 50 characters")
    @Column(name = "code")
    private String code;

    @NotBlank(message = "Customer name is required")
    @Size(max = 255, message = "Customer name must not exceed 255 characters")
    @Column(name = "name", nullable = false)
    private String name;

    @Size(max = 20, message = "Phone number must not exceed 20 characters")
    @Column(name = "phone")
    private String phone;

    @Size(max = 255, message = "Email must not exceed 255 characters")
    @Column(name = "email")
    private String email;

    @Size(max = 500, message = "Address must not exceed 500 characters")
    @Column(name = "address")
    private String address;

    @Size(max = 100, message = "Ward must not exceed 100 characters")
    @Column(name = "ward")
    private String ward;

    @Size(max = 100, message = "District must not exceed 100 characters")
    @Column(name = "district")
    private String district;

    @Size(max = 100, message = "Province must not exceed 100 characters")
    @Column(name = "province")
    private String province;

    @Column(name = "birth_date")
    private LocalDate birthDate;

    @Size(max = 20)
    @Column(name = "gender")
    private String gender;

    @Size(max = 50)
    @Column(name = "tax_code")
    private String taxCode;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    @Builder.Default
    private CustomerStatus status = CustomerStatus.ACTIVE;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
        if (status == null) {
            status = CustomerStatus.ACTIVE;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    public enum CustomerStatus {
        ACTIVE,
        INACTIVE
    }
}
