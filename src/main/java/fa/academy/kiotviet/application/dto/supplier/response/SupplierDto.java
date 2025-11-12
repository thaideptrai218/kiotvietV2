package fa.academy.kiotviet.application.dto.supplier.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class SupplierDto {
    private Long id;
    private String name;
    private String contactPerson;
    private String phone;
    private String email;
    private String address;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private String taxCode;
    private String website;
    private String notes;
    private BigDecimal outstandingBalance;
    private LocalDateTime lastPaymentDate;
    private BigDecimal creditLimit;
}
