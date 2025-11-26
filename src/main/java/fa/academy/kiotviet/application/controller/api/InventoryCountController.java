package fa.academy.kiotviet.application.controller.api;

import fa.academy.kiotviet.application.dto.inventorycount.InventoryCountItemCountUpdateRequest;
import fa.academy.kiotviet.application.dto.inventorycount.InventoryCountItemRequest;
import fa.academy.kiotviet.application.dto.inventorycount.InventoryCountRequest;
import fa.academy.kiotviet.application.dto.inventorycount.InventoryCountResponse;
import fa.academy.kiotviet.application.dto.inventorycount.InventoryCountUpdateRequest;
import fa.academy.kiotviet.application.dto.inventorycount.InventoryCountSummaryResponse;
import fa.academy.kiotviet.application.dto.inventorycount.MergeInventoryRequest;
import fa.academy.kiotviet.application.dto.inventorycount.MergeInventoryResponse;
import fa.academy.kiotviet.application.dto.shared.PagedResponse;
import fa.academy.kiotviet.application.dto.shared.SuccessResponse;
import fa.academy.kiotviet.application.service.ResponseFactory;
import fa.academy.kiotviet.core.inventorycount.domain.InventoryCountStatus;
import fa.academy.kiotviet.core.inventorycount.service.InventoryCountService;
import fa.academy.kiotviet.infrastructure.security.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/inventory-counts")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class InventoryCountController {

    private final InventoryCountService inventoryCountService;

    @GetMapping
    public SuccessResponse<PagedResponse<InventoryCountResponse>> list(
            @RequestParam(required = false) String code,
            @RequestParam(required = false) InventoryCountStatus status,
            @RequestParam(required = false) Long creatorId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt,desc") String sort) {

        Long companyId = SecurityUtil.getCurrentCompanyId();
        PagedResponse<InventoryCountResponse> response = inventoryCountService.list(
                companyId, code, status, creatorId, fromDate, toDate, page, size, sort);

        return ResponseFactory.success(response, "Inventory counts retrieved successfully");
    }

    @GetMapping("/{id}")
    public SuccessResponse<InventoryCountResponse> get(@PathVariable Long id) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        InventoryCountResponse response = inventoryCountService.get(companyId, id);
        return ResponseFactory.success(response, "Inventory count retrieved successfully");
    }

    @PostMapping
    public SuccessResponse<InventoryCountResponse> create(@Valid @RequestBody InventoryCountRequest request) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        Long userId = SecurityUtil.getCurrentUserId();
        InventoryCountResponse response = inventoryCountService.create(companyId, userId, request);
        return ResponseFactory.created(response, "Inventory count created successfully");
    }

    @PutMapping("/{id}/items/{itemId}")
    public SuccessResponse<InventoryCountResponse> updateItemCount(
            @PathVariable Long id,
            @PathVariable Long itemId,
            @Valid @RequestBody InventoryCountItemCountUpdateRequest request) {

        Long companyId = SecurityUtil.getCurrentCompanyId();
        InventoryCountResponse response = inventoryCountService.updateItemCount(companyId, id, itemId, request);
        return ResponseFactory.success(response, "Inventory count item updated successfully");
    }

    @PostMapping("/{id}/items")
    public SuccessResponse<InventoryCountResponse> addItem(
            @PathVariable Long id,
            @Valid @RequestBody InventoryCountItemRequest request) {

        Long companyId = SecurityUtil.getCurrentCompanyId();
        InventoryCountResponse response = inventoryCountService.addItem(companyId, id, request);
        return ResponseFactory.success(response, "Inventory count item added successfully");
    }

    @PutMapping("/{id}")
    public SuccessResponse<InventoryCountResponse> update(
            @PathVariable Long id,
            @Valid @RequestBody InventoryCountUpdateRequest request) {

        Long companyId = SecurityUtil.getCurrentCompanyId();
        InventoryCountResponse response = inventoryCountService.update(companyId, id, request);
        return ResponseFactory.success(response, "Inventory count updated successfully");
    }

    @DeleteMapping("/items/{itemId}")
    public SuccessResponse<InventoryCountResponse> deleteItem(@PathVariable Long itemId) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        InventoryCountResponse response = inventoryCountService.deleteItem(companyId, itemId);
        return ResponseFactory.success(response, "Inventory count item deleted successfully");
    }

    @PutMapping("/{id}/complete")
    public SuccessResponse<InventoryCountResponse> complete(@PathVariable Long id) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        InventoryCountResponse response = inventoryCountService.complete(companyId, id);
        return ResponseFactory.success(response, "Inventory count completed successfully");
    }

    @DeleteMapping("/{id}")
    public SuccessResponse<String> delete(@PathVariable Long id) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        inventoryCountService.delete(companyId, id);
        return ResponseFactory.success("Inventory count deleted successfully");
    }

    @PostMapping("/merge")
    public SuccessResponse<MergeInventoryResponse> merge(@Valid @RequestBody MergeInventoryRequest request) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        Long userId = SecurityUtil.getCurrentUserId();
        MergeInventoryResponse response = inventoryCountService.merge(companyId, userId, request);
        return ResponseFactory.success(response, "Inventory counts merged successfully");
    }

    @GetMapping("/{id}/summary")
    public SuccessResponse<InventoryCountSummaryResponse> summary(@PathVariable Long id) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        InventoryCountSummaryResponse response = inventoryCountService.summary(companyId, id);
        return ResponseFactory.success(response, "Inventory count summary retrieved");
    }

    @PostMapping("/{id}/recalculate")
    public SuccessResponse<InventoryCountSummaryResponse> recalc(@PathVariable Long id) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        InventoryCountSummaryResponse response = inventoryCountService.recalculate(companyId, id);
        return ResponseFactory.success(response, "Inventory count recalculated");
    }
}
