package fa.academy.kiotviet.application.dto.inventorycount;

import com.fasterxml.jackson.annotation.JsonInclude;
import fa.academy.kiotviet.core.inventorycount.domain.InventoryCountStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class InventoryCountResponse {

    private Long id;
    private String code;
    private LocalDateTime createdAt;
    private LocalDateTime completedAt;
    private Long createdBy;
    private InventoryCountStatus status;
    private Integer totalOnHand;
    private Integer totalActualCount;
    private Integer totalSurplus;
    private Integer totalMissing;
    private Integer totalDiffQty;
    private BigDecimal totalPriceActual;
    private String note;
    private List<InventoryCountItemDto> items;
}
