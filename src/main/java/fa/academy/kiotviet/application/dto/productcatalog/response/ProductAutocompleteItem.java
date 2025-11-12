package fa.academy.kiotviet.application.dto.productcatalog.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for product autocomplete functionality.
 * Contains minimal product information for dropdown/autocomplete displays.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductAutocompleteItem {

    private Long id;
    private String sku;
    private String name;
    private String displayName;
    private String barcode;
    private Integer onHand;
    private Boolean isAvailable;
    private String sellingPrice;

    /**
     * Alternative constructor for creating from search results
     */
    public ProductAutocompleteItem(Long id, String sku, String name, String barcode) {
        this.id = id;
        this.sku = sku;
        this.name = name;
        this.barcode = barcode;
        this.displayName = buildDisplayName(sku, name, barcode);
    }

    /**
     * Helper method to build display name with priority: SKU > Name > Barcode
     */
    private String buildDisplayName(String sku, String name, String barcode) {
        if (sku != null && !sku.trim().isEmpty()) {
            return String.format("%s - %s", sku, name != null ? name : "");
        }
        if (name != null && !name.trim().isEmpty()) {
            return name;
        }
        if (barcode != null && !barcode.trim().isEmpty()) {
            return barcode;
        }
        return "";
    }
}