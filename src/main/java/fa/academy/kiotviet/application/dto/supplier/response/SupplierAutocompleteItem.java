package fa.academy.kiotviet.application.dto.supplier.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SupplierAutocompleteItem {
    private Long id;
    private String displayName;
}

