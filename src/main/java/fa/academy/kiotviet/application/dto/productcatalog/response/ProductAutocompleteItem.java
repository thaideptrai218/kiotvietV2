package fa.academy.kiotviet.application.dto.productcatalog.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProductAutocompleteItem {
    private Long id;
    private String name;
    private String sku;
    private String barcode;
    private String displayName;
    private String unit;
    private String categoryName;
    private Integer stock;
    private String status;
}