package fa.academy.kiotviet.application.dto.customers;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerCreateRequest {

    @Size(max = 50, message = "Code must not exceed 50 characters")
    private String code;

    @NotBlank(message = "Customer name is required")
    @Size(max = 255, message = "Customer name must not exceed 255 characters")
    private String name;

    @Size(max = 20, message = "Phone number must not exceed 20 characters")
    private String phone;

    @Size(max = 255, message = "Email must not exceed 255 characters")
    private String email;

    @Size(max = 500, message = "Address must not exceed 500 characters")
    private String address;

    @Size(max = 100, message = "Ward must not exceed 100 characters")
    private String ward;

    @Size(max = 100, message = "District must not exceed 100 characters")
    private String district;

    @Size(max = 100, message = "Province must not exceed 100 characters")
    private String province;

    private LocalDate birthDate;

    @Size(max = 20)
    private String gender;

    @Size(max = 50)
    private String taxCode;

    private String notes;
}
