package fa.academy.kiotviet.application.dto.productcatalog;

import fa.academy.kiotviet.application.dto.productcatalog.response.*;
import fa.academy.kiotviet.application.dto.productcatalog.request.*;
import fa.academy.kiotviet.core.productcatalog.domain.Product;
import fa.academy.kiotviet.core.suppliers.domain.Supplier;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class ProductMapper {

    // Entity to DTO mappings

    public ProductDto toDto(Product product) {
        if (product == null) return null;

        return ProductDto.builder()
                .id(product.getId())
                .barcode(product.getBarcode())
                .sku(product.getSku())
                .name(product.getName())
                .description(product.getDescription())
                .category(toCategorySummaryDto(product.getCategory()))
                .supplier(toSupplierSummaryDto(product.getSupplier()))
                .price(product.getPrice())
                .costPrice(product.getCostPrice())
                .taxable(product.getTaxable())
                .stock(product.getStock())
                .minStock(product.getMinStock())
                .maxStock(product.getMaxStock())
                .unit(product.getUnit())
                .brand(product.getBrand())
                .tags(product.getTags())
                .status(product.getStatus() != null ? product.getStatus().name() : null)
                .isActive(product.getIsActive())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                // Computed fields
                .lowStock(product.isLowStock())
                .outOfStock(product.isOutOfStock())
                .profitMargin(product.getProfitMargin())
                .formattedPrice(product.getFormattedPrice())
                .formattedCostPrice(product.getFormattedCostPrice())
                .displayName(product.getDisplayName())
                .build();
    }

    public ProductListItemDto toListItemDto(Product product) {
        if (product == null) return null;

        return ProductListItemDto.builder()
                .id(product.getId())
                .barcode(product.getBarcode())
                .sku(product.getSku())
                .name(product.getName())
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .supplierName(product.getSupplier() != null ? product.getSupplier().getName() : null)
                .price(product.getPrice())
                .stock(product.getStock())
                .status(product.getStatus() != null ? product.getStatus().name() : null)
                .isActive(product.getIsActive())
                .createdAt(product.getCreatedAt())
                .updatedAt(product.getUpdatedAt())
                // Computed fields for UI
                .lowStock(product.isLowStock())
                .outOfStock(product.isOutOfStock())
                .formattedPrice(product.getFormattedPrice())
                .displayName(product.getDisplayName())
                .build();
    }

    public ProductAutocompleteItem toAutocompleteItem(Product product) {
        if (product == null) return null;

        return ProductAutocompleteItem.builder()
                .id(product.getId())
                .name(product.getName())
                .sku(product.getSku())
                .barcode(product.getBarcode())
                .displayName(product.getDisplayName())
                .unit(product.getUnit())
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .stock(product.getStock())
                .status(product.getStatus() != null ? product.getStatus().name() : null)
                .build();
    }

    // Request to Entity mappings

    public Product toEntity(ProductCreateRequest request) {
        if (request == null) return null;

        return Product.builder()
                .barcode(request.getBarcode())
                .sku(request.getSku())
                .name(request.getName())
                .description(request.getDescription())
                // Note: category and supplier will be set in service layer
                .price(request.getPrice())
                .costPrice(request.getCostPrice())
                .taxable(request.getTaxable() != null ? request.getTaxable() : false)
                .stock(request.getStock() != null ? request.getStock() : 0)
                .minStock(request.getMinStock() != null ? request.getMinStock() : 0)
                .maxStock(request.getMaxStock())
                .unit(request.getUnit())
                .brand(request.getBrand())
                .tags(request.getTags())
                .build();
    }

    public Product updateEntity(Product existing, ProductUpdateRequest request) {
        if (existing == null || request == null) return existing;

        if (request.getBarcode() != null) existing.setBarcode(request.getBarcode());
        if (request.getSku() != null) existing.setSku(request.getSku());
        if (request.getName() != null) existing.setName(request.getName());
        if (request.getDescription() != null) existing.setDescription(request.getDescription());
        if (request.getPrice() != null) existing.setPrice(request.getPrice());
        if (request.getCostPrice() != null) existing.setCostPrice(request.getCostPrice());
        if (request.getTaxable() != null) existing.setTaxable(request.getTaxable());
        if (request.getStock() != null) existing.setStock(request.getStock());
        if (request.getMinStock() != null) existing.setMinStock(request.getMinStock());
        if (request.getMaxStock() != null) existing.setMaxStock(request.getMaxStock());
        if (request.getUnit() != null) existing.setUnit(request.getUnit());
        if (request.getBrand() != null) existing.setBrand(request.getBrand());
        if (request.getTags() != null) existing.setTags(request.getTags());

        return existing;
    }

    // List mappings

    public List<ProductDto> toDtoList(List<Product> products) {
        if (products == null) return List.of();
        return products.stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public List<ProductListItemDto> toListItemDtoList(List<Product> products) {
        if (products == null) return List.of();
        return products.stream()
                .map(this::toListItemDto)
                .collect(Collectors.toList());
    }

    public List<ProductAutocompleteItem> toAutocompleteItemList(List<Product> products) {
        if (products == null) return List.of();
        return products.stream()
                .map(this::toAutocompleteItem)
                .collect(Collectors.toList());
    }

    // Helper methods for nested DTOs

    private ProductDto.CategorySummaryDto toCategorySummaryDto(fa.academy.kiotviet.core.productcatalog.domain.Category category) {
        if (category == null) return null;

        return ProductDto.CategorySummaryDto.builder()
                .id(category.getId())
                .name(category.getName())
                .path(category.getPath())
                .fullPathName(category.getFullPathName())
                .build();
    }

    private ProductDto.SupplierSummaryDto toSupplierSummaryDto(Supplier supplier) {
        if (supplier == null) return null;

        return ProductDto.SupplierSummaryDto.builder()
                .id(supplier.getId())
                .name(supplier.getName())
                .contactPerson(supplier.getContactPerson())
                .build();
    }
}