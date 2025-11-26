package fa.academy.kiotviet.application.dto.inventorycount;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryCountSummaryResponse {
    private Integer surplusQty;
    private Integer missingQty;
    private Integer totalDiffQty;
    private Integer totalOnHand;
    private Integer allCount;
    private Integer matchedCount;
    private Integer unmatchedCount;
    private Integer notCountedCount;
}

