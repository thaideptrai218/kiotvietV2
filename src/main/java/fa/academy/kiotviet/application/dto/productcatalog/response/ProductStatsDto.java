package fa.academy.kiotviet.application.dto.productcatalog.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProductStatsDto {
    private Long totalActive;
    private Long totalInactive;
    private Long totalActiveStatus;
    private Long totalInactiveStatus;
    private Long lowStockCount;
    private Long outOfStockCount;
}