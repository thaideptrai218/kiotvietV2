package fa.academy.kiotviet.application.dto.productcatalog.request;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Request DTO for updating an existing category.
 * All fields are optional - only provided fields will be updated.
 */
@Data
public class CategoryUpdateRequest {

    @Size(max = 255, message = "Category name cannot exceed 255 characters")
    private String name;

    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String description;

    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Color must be a valid hex color code")
    private String color;

    @Size(max = 50, message = "Icon cannot exceed 50 characters")
    private String icon;
}