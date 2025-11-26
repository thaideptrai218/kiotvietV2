package fa.academy.kiotviet.core.inventorycount.service;

import fa.academy.kiotviet.application.dto.inventorycount.InventoryCountItemCountUpdateRequest;
import fa.academy.kiotviet.application.dto.inventorycount.InventoryCountItemRequest;
import fa.academy.kiotviet.application.dto.inventorycount.InventoryCountRequest;
import fa.academy.kiotviet.application.dto.inventorycount.InventoryCountResponse;
import fa.academy.kiotviet.application.dto.inventorycount.InventoryCountUpdateRequest;
import fa.academy.kiotviet.application.dto.inventorycount.InventoryCountSummaryResponse;
import fa.academy.kiotviet.application.dto.inventorycount.MergeInventoryRequest;
import fa.academy.kiotviet.application.dto.inventorycount.MergeInventoryResponse;
import fa.academy.kiotviet.application.dto.shared.PagedResponse;
import fa.academy.kiotviet.core.inventorycount.domain.InventoryCountStatus;

import java.time.LocalDate;

public interface InventoryCountService {

    PagedResponse<InventoryCountResponse> list(
            Long companyId,
            String code,
            InventoryCountStatus status,
            Long creatorId,
            LocalDate fromDate,
            LocalDate toDate,
            int page,
            int size,
            String sort
    );

    InventoryCountResponse get(Long companyId, Long id);

    InventoryCountResponse create(Long companyId, Long userId, InventoryCountRequest request);

    InventoryCountResponse updateItemCount(Long companyId, Long inventoryCountId, Long itemId,
                                           InventoryCountItemCountUpdateRequest request);

    InventoryCountResponse addItem(Long companyId, Long inventoryCountId, InventoryCountItemRequest request);

    InventoryCountResponse deleteItem(Long companyId, Long itemId);

    InventoryCountResponse complete(Long companyId, Long id);

    InventoryCountResponse update(Long companyId, Long id, InventoryCountUpdateRequest request);

    MergeInventoryResponse merge(Long companyId, Long userId, MergeInventoryRequest request);

    InventoryCountSummaryResponse summary(Long companyId, Long id);

    InventoryCountSummaryResponse recalculate(Long companyId, Long id);

    void delete(Long companyId, Long id);
}
