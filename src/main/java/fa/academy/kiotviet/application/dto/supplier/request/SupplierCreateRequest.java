package fa.academy.kiotviet.application.dto.supplier.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.Data;

@Data
public class SupplierCreateRequest {
    @NotBlank
    @Size(max = 255)
    private String name;

    @Size(max = 255)
    private String contactPerson;

    @Pattern(regexp = "^[0-9\\-\\+\\s()]*$", message = "Invalid phone format")
    @Size(max = 20)
    private String phone;

    @Email
    @Size(max = 255)
    private String email;

    private String address;

    @Size(max = 50)
    @Pattern(regexp = "^[A-Za-z0-9-]+$", message = "Invalid tax code format")
    private String taxCode;

    @Size(max = 255)
    private String website;

    private String notes;

    @PositiveOrZero
    private java.math.BigDecimal creditLimit;
}
