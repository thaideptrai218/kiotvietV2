package fa.academy.kiotviet.application.dto.customers;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerAutocompleteItem {
    private Long id;
    private String name;
    private String phone;
    private String code;
}
