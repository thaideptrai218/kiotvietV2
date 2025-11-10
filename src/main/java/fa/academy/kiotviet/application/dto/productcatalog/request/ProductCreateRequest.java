package fa.academy.kiotviet.application.dto.productcatalog.request;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductCreateRequest {

    @Size(max = 50, message = "Barcode must be less than 50 characters")
    private String barcode;

    @Size(max = 50, message = "SKU must be less than 50 characters")
    private String sku;

    @NotBlank(message = "Product name is required")
    @Size(max = 255, message = "Product name must be less than 255 characters")
    private String name;

    @Size(max = 1000, message = "Description must be less than 1000 characters")
    private String description;

    private Long categoryId;

    private Long supplierId;

    @DecimalMin(value = "0.00", message = "Price must be non-negative")
    @Digits(integer = 9, fraction = 2, message = "Price must have maximum 9 integer digits and 2 decimal places")
    private BigDecimal price;

    @DecimalMin(value = "0.00", message = "Cost price must be non-negative")
    @Digits(integer = 9, fraction = 2, message = "Cost price must have maximum 9 integer digits and 2 decimal places")
    private BigDecimal costPrice;

    private Boolean taxable = false;

    @Min(value = 0, message = "Stock must be non-negative")
    private Integer stock = 0;

    @Min(value = 0, message = "Minimum stock must be non-negative")
    private Integer minStock = 0;

    @Min(value = 0, message = "Maximum stock must be non-negative")
    private Integer maxStock;

    @Size(max = 50, message = "Unit must be less than 50 characters")
    private String unit;

    @Size(max = 100, message = "Brand must be less than 100 characters")
    private String brand;

    @Size(max = 500, message = "Tags must be less than 500 characters")
    private String tags;
}