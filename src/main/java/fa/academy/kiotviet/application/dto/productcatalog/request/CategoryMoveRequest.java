package fa.academy.kiotviet.application.dto.productcatalog.request;

import lombok.Data;

/**
 * Request DTO for moving a category to a new parent.
 * Used to change category hierarchy position.
 */
@Data
public class CategoryMoveRequest {

    // New parent ID - null means move to root level
    private Long newParentId;
}