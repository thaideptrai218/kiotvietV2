package fa.academy.kiotviet.application.dto.productcatalog.request;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Request DTO for updating an existing Brand.
 * All fields are optional to allow partial updates.
 */
@Data
public class BrandUpdateRequest {

    @Size(max = 255, message = "Brand name must not exceed 255 characters")
    private String name;

    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;

    @Size(max = 500, message = "Website URL must not exceed 500 characters")
    @Pattern(regexp = "^$|^https?://[\\w\\-]+(\\.[\\w\\-]+)+([\\w\\-.,@?^=%&:/~+#]*[\\w\\-@?^=%&/~+#])?$",
             message = "Website must be a valid URL")
    private String website;

    @Size(max = 500, message = "Logo URL must not exceed 500 characters")
    private String logoUrl;

    private Boolean isActive;
}