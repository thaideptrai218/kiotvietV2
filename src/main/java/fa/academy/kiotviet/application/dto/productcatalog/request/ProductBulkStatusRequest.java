package fa.academy.kiotviet.application.dto.productcatalog.request;

import fa.academy.kiotviet.core.productcatalog.domain.Product;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class ProductBulkStatusRequest {

    @NotEmpty(message = "Product IDs cannot be empty")
    private List<Long> productIds;

    @NotNull(message = "Status is required")
    private Product.ProductStatus status;
}