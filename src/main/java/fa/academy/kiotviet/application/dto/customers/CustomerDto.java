package fa.academy.kiotviet.application.dto.customers;

import fa.academy.kiotviet.core.customers.domain.Customer;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerDto {
    private Long id;
    private String code;
    private String name;
    private String phone;
    private String email;
    private String address;
    private String ward;
    private String district;
    private String province;
    private LocalDate birthDate;
    private String gender;
    private String taxCode;
    private String notes;
    private Customer.CustomerStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
