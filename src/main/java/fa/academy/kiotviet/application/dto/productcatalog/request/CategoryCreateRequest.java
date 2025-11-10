package fa.academy.kiotviet.application.dto.productcatalog.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Request DTO for creating a new category.
 * Can be used for both root categories and subcategories.
 */
@Data
public class CategoryCreateRequest {

    @NotBlank(message = "Category name is required")
    @Size(max = 255, message = "Category name cannot exceed 255 characters")
    private String name;

    @Size(max = 1000, message = "Description cannot exceed 1000 characters")
    private String description;

    @Pattern(regexp = "^#[0-9A-Fa-f]{6}$", message = "Color must be a valid hex color code")
    private String color;

    @Size(max = 50, message = "Icon cannot exceed 50 characters")
    private String icon;

    // For subcategories - null means root category
    private Long parentId;
}