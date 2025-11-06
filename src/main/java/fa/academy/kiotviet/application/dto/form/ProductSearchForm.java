package fa.academy.kiotviet.application.dto.form;

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
public class ProductSearchForm {
    private String keyword;
    private String category;
    private String barcode;
    private String supplier;
    private Double minPrice;
    private Double maxPrice;
    private boolean inStockOnly;
    private String sortBy; // name, price, created_at, quantity
    private String sortOrder; // asc, desc
    @Builder.Default
    private int page = 1;

    @Builder.Default
    private int size = 20;
}