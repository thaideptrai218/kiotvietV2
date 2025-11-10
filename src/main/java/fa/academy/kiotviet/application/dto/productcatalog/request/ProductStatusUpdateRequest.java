package fa.academy.kiotviet.application.dto.productcatalog.request;

import fa.academy.kiotviet.core.productcatalog.domain.Product;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProductStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private Product.ProductStatus status;
}