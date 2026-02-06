package fa.academy.kiotviet.core.systemadmin.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO for creating a new company in system admin panel
 * Used by system admins to create new tenant companies
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemAdminCompanyCreateDTO {

    @NotBlank(message = "Company name is required")
    @Size(max = 255, message = "Company name must not exceed 255 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    @Size(max = 255, message = "Email must not exceed 255 characters")
    private String email;

    @Pattern(regexp = "^[0-9\\-\\+\\s()]*$", message = "Invalid phone format")
    @Size(max = 20, message = "Phone must not exceed 20 characters")
    private String phone;

    @Size(max = 1000, message = "Address must not exceed 1000 characters")
    private String address;

    @Size(max = 100, message = "Country must not exceed 100 characters")
    private String country;

    @Size(max = 255, message = "Province must not exceed 255 characters")
    private String province;

    @Size(max = 255, message = "Ward must not exceed 255 characters")
    private String ward;

    @Size(max = 50, message = "Tax code must not exceed 50 characters")
    private String taxCode;
}
