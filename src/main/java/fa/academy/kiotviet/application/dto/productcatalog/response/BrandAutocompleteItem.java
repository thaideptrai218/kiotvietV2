package fa.academy.kiotviet.application.dto.productcatalog.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for brand autocomplete functionality.
 * Contains minimal brand information for dropdown/autocomplete displays.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BrandAutocompleteItem {

    private Long id;
    private String name;
    private String displayName;
    private Boolean isActive;
    private String website;

    /**
     * Alternative constructor for creating from search results
     */
    public BrandAutocompleteItem(Long id, String name) {
        this.id = id;
        this.name = name;
        this.displayName = name;
        this.isActive = true;
    }

    /**
     * Constructor with active status
     */
    public BrandAutocompleteItem(Long id, String name, Boolean isActive) {
        this.id = id;
        this.name = name;
        this.displayName = name;
        this.isActive = isActive;
    }
}