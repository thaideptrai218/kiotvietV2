package fa.academy.kiotviet.application.dto.productcatalog.request;

import fa.academy.kiotviet.core.productcatalog.domain.Product;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

/**
 * Request DTO for updating an existing Product.
 * All fields are optional to allow partial updates.
 */
@Data
public class ProductUpdateRequest {

    @Size(max = 100, message = "SKU must not exceed 100 characters")
    private String sku;

    @Size(max = 255, message = "Product name must not exceed 255 characters")
    private String name;

    @Size(max = 50, message = "Barcode must not exceed 50 characters")
    private String barcode;

    @Size(max = 2000, message = "Description must not exceed 2000 characters")
    private String description;

    private String image;

    @DecimalMin(value = "0.01", message = "Selling price must be greater than 0")
    @Digits(integer = 10, fraction = 2, message = "Selling price must have up to 10 digits and 2 decimal places")
    private BigDecimal sellingPrice;

    @DecimalMin(value = "0.01", message = "Cost price must be greater than 0")
    @Digits(integer = 10, fraction = 2, message = "Cost price must have up to 10 digits and 2 decimal places")
    private BigDecimal costPrice;

    @Min(value = 0, message = "On hand quantity cannot be negative")
    private Integer onHand;

    @Min(value = 0, message = "Minimum level cannot be negative")
    private Integer minLevel;

    @Min(value = 0, message = "Maximum level cannot be negative")
    private Integer maxLevel;

    private Product.ProductStatus status;

    private Boolean isTracked;

    private Long categoryId;

    private Long supplierId;

    private Long brandId;
}