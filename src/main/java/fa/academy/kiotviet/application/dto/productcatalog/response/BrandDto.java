package fa.academy.kiotviet.application.dto.productcatalog.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO for Brand entities.
 * Contains brand information for API responses.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BrandDto {

    private Long id;
    private String name;
    private String description;
    private String website;
    private String displayWebsite;
    private String logoUrl;
    private Boolean isActive;
    private Boolean hasLogo;
    private Boolean hasWebsite;
    private Boolean isComplete;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}