package fa.academy.kiotviet.application.dto.productcatalog.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

/**
 * Request DTO for reordering categories within the same parent level.
 */
@Data
public class CategoryReorderRequest {

    @NotEmpty(message = "Category IDs list cannot be empty")
    private List<@NotNull Long> categoryIds;
}