package fa.academy.kiotviet.application.mapper.inventorycount;

import fa.academy.kiotviet.application.dto.inventorycount.InventoryCountItemDto;
import fa.academy.kiotviet.application.dto.inventorycount.InventoryCountResponse;
import fa.academy.kiotviet.core.inventorycount.domain.InventoryCount;
import fa.academy.kiotviet.core.inventorycount.domain.InventoryCountItem;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class InventoryCountMapper {

    public InventoryCountResponse toResponse(InventoryCount entity, boolean includeItems) {
        if (entity == null) {
            return null;
        }

        List<InventoryCountItemDto> items = includeItems
                ? entity.getItems().stream()
                .map(this::toItemDto)
                .collect(Collectors.toList())
                : null;

        return InventoryCountResponse.builder()
                .id(entity.getId())
                .code(entity.getCode())
                .createdAt(entity.getCreatedAt())
                .completedAt(entity.getCompletedAt())
                .createdBy(entity.getCreatedBy())
                .status(entity.getStatus())
                .totalOnHand(entity.getTotalOnHand())
                .totalActualCount(entity.getTotalActualCount())
                .totalSurplus(entity.getTotalSurplus())
                .totalMissing(entity.getTotalMissing())
                .totalDiffQty(entity.getTotalDiffQty())
                .totalPriceActual(entity.getTotalPriceActual())
                .note(entity.getNote())
                .items(items)
                .build();
    }

    public InventoryCountItemDto toItemDto(InventoryCountItem item) {
        if (item == null) {
            return null;
        }

        return InventoryCountItemDto.builder()
                .id(item.getId())
                .productId(item.getProductId())
                .productNumber(item.getProductNumber())
                .productName(item.getProductName())
                .unit(item.getUnit())
                .onHand(item.getOnHand())
                .counted(item.getCounted())
                .diffQty(item.getDiffQty())
                .diffCost(item.getDiffCost())
                .build();
    }
}

