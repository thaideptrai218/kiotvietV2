package fa.academy.kiotviet.application.dto.productcatalog.request;

import fa.academy.kiotviet.core.productcatalog.domain.Product;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

/**
 * Request DTO for creating a new Product.
 * Contains all required fields and validation rules for product creation.
 */
@Data
public class ProductCreateRequest {

    @NotBlank(message = "SKU is required")
    @Size(max = 100, message = "SKU must not exceed 100 characters")
    private String sku;

    @NotBlank(message = "Product name is required")
    @Size(max = 255, message = "Product name must not exceed 255 characters")
    private String name;

    @Size(max = 50, message = "Barcode must not exceed 50 characters")
    private String barcode;

    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;

    @NotNull(message = "Selling price is required")
    @DecimalMin(value = "0.01", message = "Selling price must be greater than 0")
    @Digits(integer = 10, fraction = 2, message = "Selling price must have up to 10 digits and 2 decimal places")
    private BigDecimal sellingPrice;

    @NotNull(message = "Cost price is required")
    @DecimalMin(value = "0.01", message = "Cost price must be greater than 0")
    @Digits(integer = 10, fraction = 2, message = "Cost price must have up to 10 digits and 2 decimal places")
    private BigDecimal costPrice;

    @Min(value = 0, message = "On hand quantity cannot be negative")
    private Integer onHand = 0;

    @Min(value = 0, message = "Minimum level cannot be negative")
    private Integer minLevel = 0;

    @Min(value = 0, message = "Maximum level cannot be negative")
    private Integer maxLevel = 0;

    private Product.ProductStatus status = Product.ProductStatus.ACTIVE;

    private Boolean isTracked = true;

    private Long categoryId;

    private Long supplierId;

    private Long brandId;
}