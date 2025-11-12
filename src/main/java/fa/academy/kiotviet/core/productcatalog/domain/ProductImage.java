package fa.academy.kiotviet.core.productcatalog.domain;

import fa.academy.kiotviet.core.tenant.domain.Company;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * ProductImage entity for managing product images.
 * Supports multiple images per product with ordering and primary image selection.
 *
 * Features:
 * - Multiple images per product
 * - Image ordering for display priority
 * - Primary image selection
 * - Company-level isolation
 * - File size tracking
 * - Alt text for accessibility
 */
@Entity
@Table(name = "product_images",
    indexes = {
        @Index(name = "idx_product_order", columnList = "product_id,image_order"),
        @Index(name = "idx_company_product", columnList = "company_id,product_id"),
        @Index(name = "idx_primary_image", columnList = "product_id,is_primary")
    }
)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false, foreignKey = @ForeignKey(name = "fk_product_image_product"))
    private Product product;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false, foreignKey = @ForeignKey(name = "fk_product_image_company"))
    private Company company;

    @NotBlank(message = "Image URL is required")
    @Size(max = 500, message = "Image URL must not exceed 500 characters")
    @Column(name = "image_url", nullable = false)
    private String imageUrl;

    @Size(max = 255, message = "Alt text must not exceed 255 characters")
    @Column(name = "alt_text")
    private String altText;

    @Min(value = 0, message = "File size cannot be negative")
    @Column(name = "file_size")
    private Long fileSize; // in bytes

    @Min(value = 0, message = "Image order cannot be negative")
    @Column(name = "image_order")
    @Builder.Default
    private Integer imageOrder = 0;

    @Column(name = "is_primary")
    @Builder.Default
    private Boolean isPrimary = false;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // Lifecycle methods
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    // Business logic helper methods

    /**
     * Get file size in human-readable format
     */
    public String getFormattedFileSize() {
        if (fileSize == null || fileSize == 0) {
            return "Unknown size";
        }

        if (fileSize < 1024) {
            return fileSize + " B";
        } else if (fileSize < 1024 * 1024) {
            return String.format("%.1f KB", fileSize / 1024.0);
        } else {
            return String.format("%.1f MB", fileSize / (1024.0 * 1024.0));
        }
    }

    /**
     * Check if this is the primary image
     */
    public boolean isPrimaryImage() {
        return Boolean.TRUE.equals(isPrimary);
    }

    /**
     * Get filename from URL
     */
    public String getFileName() {
        if (imageUrl == null || imageUrl.trim().isEmpty()) {
            return "";
        }

        // Extract filename from URL path
        int lastSlash = imageUrl.lastIndexOf('/');
        if (lastSlash >= 0 && lastSlash < imageUrl.length() - 1) {
            return imageUrl.substring(lastSlash + 1);
        }
        return imageUrl;
    }

    /**
     * Get file extension
     */
    public String getFileExtension() {
        String fileName = getFileName();
        if (fileName.trim().isEmpty()) {
            return "";
        }

        int lastDot = fileName.lastIndexOf('.');
        if (lastDot >= 0 && lastDot < fileName.length() - 1) {
            return fileName.substring(lastDot + 1).toLowerCase();
        }
        return "";
    }

    /**
     * Check if this is a valid image file based on extension
     */
    public boolean isValidImageFile() {
        String extension = getFileExtension();
        return extension.matches("(jpg|jpeg|png|gif|bmp|webp)");
    }

    /**
     * Get display text for the image
     */
    public String getDisplayText() {
        if (altText != null && !altText.trim().isEmpty()) {
            return altText;
        }
        return getFileName();
    }

    /**
     * Check if the image file is reasonably sized (less than 10MB)
     */
    public boolean isReasonableSize() {
        return fileSize == null || fileSize <= 10 * 1024 * 1024; // 10MB
    }

    /**
     * Get URL for thumbnail (assuming naming convention)
     */
    public String getThumbnailUrl() {
        if (imageUrl == null || imageUrl.trim().isEmpty()) {
            return "";
        }

        String fileName = getFileName();
        if (fileName.trim().isEmpty()) {
            return imageUrl;
        }

        // Generate thumbnail URL by inserting "_thumb" before extension
        int lastDot = imageUrl.lastIndexOf('.');
        if (lastDot > 0) {
            return imageUrl.substring(0, lastDot) + "_thumb" + imageUrl.substring(lastDot);
        }

        return imageUrl;
    }
}