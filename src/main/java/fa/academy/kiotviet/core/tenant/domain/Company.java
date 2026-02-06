package fa.academy.kiotviet.core.tenant.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "companies")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Company name is required")
    @Size(max = 255, message = "Company name must not exceed 255 characters")
    @Column(name = "name", nullable = false)
    private String name;

    @Email(message = "Invalid email format")
    @Size(max = 255, message = "Email must not exceed 255 characters")
    @Column(unique = true)
    private String email;

    @Pattern(regexp = "^[0-9\\-\\+\\s()]*$", message = "Invalid phone format")
    @Size(max = 20, message = "Phone must not exceed 20 characters")
    @Column(name = "phone")
    private String phone;

    @Size(max = 1000, message = "Address must not exceed 1000 characters")
    @Column(name = "address", columnDefinition = "TEXT")
    private String address;

    @Size(max = 100, message = "Country must not exceed 100 characters")
    @Column(name = "country", length = 100)
    private String country;

    @Size(max = 10, message = "Country flag code must not exceed 10 characters")
    @Column(name = "country_flag", length = 10)
    private String countryFlag;

    @Size(max = 255, message = "Province must not exceed 255 characters")
    @Column(name = "province")
    private String province;

    @Size(max = 255, message = "Ward must not exceed 255 characters")
    @Column(name = "ward")
    private String ward;

    @Column(name = "logo_url", columnDefinition = "TEXT")
    private String logoUrl;

    @Size(max = 50, message = "Tax code must not exceed 50 characters")
    @Column(name = "tax_code")
    private String taxCode;

    @NotNull(message = "Active status is required")
    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "is_suspended", nullable = false)
    @Builder.Default
    private Boolean isSuspended = false;

    @Column(name = "created_at", updatable = false)
    private java.time.LocalDateTime createdAt;

    @Column(name = "updated_at")
    private java.time.LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = java.time.LocalDateTime.now();
        updatedAt = java.time.LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = java.time.LocalDateTime.now();
    }
}
