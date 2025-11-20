package fa.academy.kiotviet.application.dto.company.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompanyDto {
    private Long id;
    private String url;
    private String name;
    private String email;
    private String phone;
    private String country;
    private String countryFlag;
    private String address;
    private String province;
    private String ward;
    private String taxCode;
    private String logoUrl;
}
