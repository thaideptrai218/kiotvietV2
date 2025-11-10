package fa.academy.kiotviet.application.dto.productcatalog.request;

import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

import java.util.List;

@Data
public class ProductBulkDeleteRequest {

    @NotEmpty(message = "Product IDs cannot be empty")
    private List<Long> productIds;
}