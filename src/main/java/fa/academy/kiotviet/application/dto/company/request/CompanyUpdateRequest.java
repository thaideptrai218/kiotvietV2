package fa.academy.kiotviet.application.dto.company.request;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class CompanyUpdateRequest {

    @Pattern(regexp = "^[0-9\\-\\+\\s()]*$", message = "Invalid phone format")
    @Size(max = 20)
    private String phone;

    @Size(max = 100)
    private String country;

    @Size(max = 10)
    private String countryFlag;

    @Size(max = 255)
    private String name;

    @Size(max = 1000)
    private String address;

    @Size(max = 255)
    private String province;

    @Size(max = 255)
    private String ward;
}
