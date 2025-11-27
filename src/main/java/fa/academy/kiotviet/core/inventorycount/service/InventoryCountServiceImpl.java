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
import fa.academy.kiotviet.application.mapper.inventorycount.InventoryCountMapper;
import fa.academy.kiotviet.core.inventorycount.domain.InventoryCount;
import fa.academy.kiotviet.core.inventorycount.domain.InventoryCountItem;
import fa.academy.kiotviet.core.inventorycount.domain.InventoryCountStatus;
import fa.academy.kiotviet.core.productcatalog.service.ProductService;
import fa.academy.kiotviet.core.inventorycount.repository.InventoryCountItemRepository;
import fa.academy.kiotviet.core.inventorycount.repository.InventoryCountRepository;
import fa.academy.kiotviet.core.inventorycount.repository.InventoryCountSpecifications;
import fa.academy.kiotviet.infrastructure.exception.BadRequestException;
import fa.academy.kiotviet.infrastructure.exception.ConflictException;
import fa.academy.kiotviet.infrastructure.exception.NotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.Map;
import java.util.LinkedHashMap;

@Service
@RequiredArgsConstructor
@Transactional
public class InventoryCountServiceImpl implements InventoryCountService {

    private static final Set<String> ALLOWED_SORT_FIELDS =
            Set.of("createdAt", "code", "status", "totalDiffQty", "totalActualCount", "createdBy");

    private final InventoryCountRepository inventoryCountRepository;
    private final InventoryCountItemRepository inventoryCountItemRepository;
    private final InventoryCountMapper inventoryCountMapper;
    private final InventoryCountCodeGenerator inventoryCountCodeGenerator;
    private final ProductService productService;

    @Override
    @Transactional(readOnly = true)
    public PagedResponse<InventoryCountResponse> list(Long companyId,
                                                      String code,
                                                      InventoryCountStatus status,
                                                      Long creatorId,
                                                      LocalDate fromDate,
                                                      LocalDate toDate,
                                                      int page,
                                                      int size,
                                                      String sort) {

        int normalizedPage = Math.max(page, 0);
        int normalizedSize = Math.min(Math.max(size, 1), 200);
        Pageable pageable = buildPageable(normalizedPage, normalizedSize, sort);

        Specification<InventoryCount> specification = Specification
                .where(InventoryCountSpecifications.belongsToCompany(companyId))
                .and(InventoryCountSpecifications.codeContains(code))
                .and(InventoryCountSpecifications.hasStatus(status))
                .and(InventoryCountSpecifications.createdBy(creatorId))
                .and(InventoryCountSpecifications.createdFrom(fromDate))
                .and(InventoryCountSpecifications.createdTo(toDate));

        Page<InventoryCount> result = inventoryCountRepository.findAll(specification, pageable);

        if (result.isEmpty()) {
            return PagedResponse.empty(normalizedPage, normalizedSize);
        }

        List<InventoryCountResponse> content = result.getContent().stream()
                .map(entity -> inventoryCountMapper.toResponse(entity, false))
                .toList();

        return PagedResponse.of(content, result.getNumber(), result.getSize(), result.getTotalElements());
    }

    @Override
    @Transactional(readOnly = true)
    public InventoryCountResponse get(Long companyId, Long id) {
        InventoryCount entity = inventoryCountRepository.findDetailedByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new NotFoundException("Inventory count not found", "INVENTORY_COUNT_NOT_FOUND"));
        return inventoryCountMapper.toResponse(entity, true);
    }

    @Override
    public InventoryCountResponse create(Long companyId, Long userId, InventoryCountRequest request) {
        if (request == null || request.getItems() == null || request.getItems().isEmpty()) {
            throw new BadRequestException("Inventory count must contain at least one item", "INVENTORY_COUNT_ITEMS_REQUIRED");
        }

        String code = StringUtils.hasText(request.getCode())
                ? request.getCode().trim().toUpperCase()
                : inventoryCountCodeGenerator.nextCode(companyId);

        if (inventoryCountRepository.existsByCompanyIdAndCodeIgnoreCase(companyId, code)) {
            throw new ConflictException("Inventory count code already exists", "INVENTORY_COUNT_CODE_DUPLICATE");
        }

        InventoryCount inventoryCount = InventoryCount.builder()
                .code(code)
                .companyId(companyId)
                .createdBy(userId)
                .createdAt(LocalDateTime.now())
                .status(InventoryCountStatus.DRAFT)
                .note(StringUtils.hasText(request.getNote()) ? request.getNote().trim() : null)
                .totalPriceActual(BigDecimal.ZERO)
                .build();

        request.getItems().forEach(itemRequest -> inventoryCount.addItem(toEntity(itemRequest, companyId, inventoryCount)));

        recalculateTotals(inventoryCount);

        InventoryCount saved = inventoryCountRepository.save(inventoryCount);
        return inventoryCountMapper.toResponse(saved, true);
    }

    @Override
    public InventoryCountResponse updateItemCount(Long companyId, Long inventoryCountId, Long itemId,
                                                  InventoryCountItemCountUpdateRequest request) {
        InventoryCount inventoryCount = fetchAggregate(companyId, inventoryCountId);

        InventoryCountItem item = inventoryCount.getItems().stream()
                .filter(existing -> Objects.equals(existing.getId(), itemId))
                .findFirst()
                .orElseThrow(() -> new NotFoundException("Inventory count item not found", "INVENTORY_COUNT_ITEM_NOT_FOUND"));

        Integer previousCounted = item.getCounted();
        item.setCounted(request.getCounted());
        recalculateItem(item);
        recalculateTotals(inventoryCount);

        InventoryCount saved = inventoryCountRepository.save(inventoryCount);
        if (!Objects.equals(previousCounted, item.getCounted())) {
            syncProductStockIfActive(inventoryCount, item);
        }
        return inventoryCountMapper.toResponse(saved, true);
    }

    @Override
    public InventoryCountResponse addItem(Long companyId, Long inventoryCountId, InventoryCountItemRequest request) {
        InventoryCount inventoryCount = fetchAggregate(companyId, inventoryCountId);

        InventoryCountItem newItem = toEntity(request, companyId, inventoryCount);
        inventoryCount.addItem(newItem);
        recalculateTotals(inventoryCount);

        InventoryCount saved = inventoryCountRepository.save(inventoryCount);
        syncProductStockIfActive(inventoryCount, newItem);
        return inventoryCountMapper.toResponse(saved, true);
    }

    @Override
    public InventoryCountResponse deleteItem(Long companyId, Long itemId) {
        InventoryCountItem item = inventoryCountItemRepository.findByIdAndCompanyId(itemId, companyId)
                .orElseThrow(() -> new NotFoundException("Inventory count item not found", "INVENTORY_COUNT_ITEM_NOT_FOUND"));

        InventoryCount inventoryCount = fetchAggregate(companyId, item.getInventoryCount().getId());

        inventoryCount.getItems().removeIf(existing -> Objects.equals(existing.getId(), item.getId()));
        recalculateTotals(inventoryCount);

        InventoryCount saved = inventoryCountRepository.save(inventoryCount);
        return inventoryCountMapper.toResponse(saved, true);
    }

    @Override
    public InventoryCountResponse complete(Long companyId, Long id) {
        InventoryCount inventoryCount = fetchAggregate(companyId, id);

        inventoryCount.setStatus(InventoryCountStatus.COMPLETED);
        inventoryCount.setCompletedAt(LocalDateTime.now());

        InventoryCount saved = inventoryCountRepository.save(inventoryCount);
        syncAllProductStocks(inventoryCount);
        return inventoryCountMapper.toResponse(saved, true);
    }

    @Override
    public InventoryCountResponse update(Long companyId, Long id, InventoryCountUpdateRequest request) {
        if (request == null) {
            throw new BadRequestException("Update request is required", "INVENTORY_COUNT_UPDATE_REQUIRED");
        }

        InventoryCount inventoryCount = fetchAggregate(companyId, id);

        String note = request.getNote();
        inventoryCount.setNote(StringUtils.hasText(note) ? note.trim() : null);

        InventoryCount saved = inventoryCountRepository.save(inventoryCount);
        return inventoryCountMapper.toResponse(saved, true);
    }

    @Override
    public void delete(Long companyId, Long id) {
        InventoryCount inventoryCount = fetchAggregate(companyId, id);
        inventoryCountRepository.delete(inventoryCount);
    }

    @Override
    public InventoryCountSummaryResponse summary(Long companyId, Long id) {
        InventoryCount inventoryCount = fetchAggregate(companyId, id);
        return buildSummary(inventoryCount);
    }

    @Override
    public InventoryCountSummaryResponse recalculate(Long companyId, Long id) {
        InventoryCount inventoryCount = fetchAggregate(companyId, id);
        recalculateTotals(inventoryCount);
        InventoryCount saved = inventoryCountRepository.save(inventoryCount);
        return buildSummary(saved);
    }

    @Override
    public MergeInventoryResponse merge(Long companyId, Long userId, MergeInventoryRequest request) {
        if (request == null || request.getIds() == null || request.getIds().isEmpty()) {
            throw new BadRequestException("Inventory ids are required for merge", "MERGE_IDS_REQUIRED");
        }

        List<Long> ids = request.getIds();
        List<InventoryCount> inventories = inventoryCountRepository.findAllByIdInAndCompanyId(ids, companyId);

        if (inventories.size() != ids.size()) {
            throw new NotFoundException("One or more inventory counts not found", "INVENTORY_COUNT_NOT_FOUND");
        }

        for (InventoryCount inv : inventories) {
            if (inv.getStatus() != InventoryCountStatus.DRAFT) {
                throw new BadRequestException("Only draft inventory counts can be merged", "MERGE_ONLY_DRAFT");
            }
        }

        // Aggregate items by productNumber
        Map<String, InventoryCountItem> aggregated = new LinkedHashMap<>();
        for (InventoryCount inv : inventories) {
            for (InventoryCountItem item : inv.getItems()) {
                String key = item.getProductNumber() != null ? item.getProductNumber() : String.valueOf(item.getProductId());
                InventoryCountItem agg = aggregated.get(key);
                if (agg == null) {
                    agg = InventoryCountItem.builder()
                            .productId(item.getProductId())
                            .productNumber(item.getProductNumber())
                            .productName(item.getProductName())
                            .unit(item.getUnit())
                            .onHand(0)
                            .counted(0)
                            .diffCost(BigDecimal.ZERO)
                            .companyId(companyId)
                            .build();
                    aggregated.put(key, agg);
                }
                agg.setOnHand(agg.getOnHand() + (item.getOnHand() != null ? item.getOnHand() : 0));
                agg.setCounted(agg.getCounted() + (item.getCounted() != null ? item.getCounted() : 0));
            }
        }

        InventoryCount merged = InventoryCount.builder()
                .code(inventoryCountCodeGenerator.nextCode(companyId))
                .companyId(companyId)
                .createdBy(userId)
                .createdAt(LocalDateTime.now())
                .status(InventoryCountStatus.DRAFT)
                .totalPriceActual(BigDecimal.ZERO)
                .build();

        aggregated.values().forEach(item -> {
            item.setDiffQty((item.getCounted() != null ? item.getCounted() : 0) - (item.getOnHand() != null ? item.getOnHand() : 0));
            merged.addItem(item);
        });

        recalculateTotals(merged);
        InventoryCount savedMerged = inventoryCountRepository.save(merged);

        // cancel old inventories
        for (InventoryCount inv : inventories) {
            inv.setStatus(InventoryCountStatus.CANCELLED);
            inv.setMergedInto(savedMerged.getId());
        }
        inventoryCountRepository.saveAll(inventories);

        return MergeInventoryResponse.builder()
                .newInventoryId(savedMerged.getId())
                .success(true)
                .build();
    }

    private Pageable buildPageable(int page, int size, String sort) {
        String property = "createdAt";
        Sort.Direction direction = Sort.Direction.DESC;

        if (StringUtils.hasText(sort)) {
            String[] tokens = sort.split(",");
            String requestedProperty = tokens[0];
            if (ALLOWED_SORT_FIELDS.contains(requestedProperty)) {
                property = requestedProperty;
            }
            if (tokens.length > 1 && "asc".equalsIgnoreCase(tokens[1])) {
                direction = Sort.Direction.ASC;
            }
        }

        return PageRequest.of(page, size, Sort.by(direction, property));
    }

    private InventoryCount fetchAggregate(Long companyId, Long id) {
        return inventoryCountRepository.findDetailedByIdAndCompanyId(id, companyId)
                .orElseThrow(() -> new NotFoundException("Inventory count not found", "INVENTORY_COUNT_NOT_FOUND"));
    }

    private void ensureDraft(InventoryCount inventoryCount) {
        // no-op: edits are now allowed regardless of status
    }

    private InventoryCountItem toEntity(InventoryCountItemRequest request, Long companyId, InventoryCount inventoryCount) {
        InventoryCountItem item = InventoryCountItem.builder()
                .inventoryCount(inventoryCount)
                .productId(request.getProductId())
                .productNumber(request.getProductNumber())
                .productName(request.getProductName())
                .unit(request.getUnit())
                .onHand(request.getOnHand())
                .counted(request.getCounted())
                .diffCost(BigDecimal.ZERO)
                .companyId(companyId)
                .build();
        recalculateItem(item);
        return item;
    }

    private void recalculateTotals(InventoryCount inventoryCount) {
        int totalOnHand = 0;
        int totalActual = 0;
        int totalSurplus = 0;
        int totalMissing = 0;
        int totalDiff = 0;

        for (InventoryCountItem item : inventoryCount.getItems()) {
            recalculateItem(item);

            int onHand = item.getOnHand() != null ? item.getOnHand() : 0;
            int counted = item.getCounted() != null ? item.getCounted() : 0;
            int diff = item.getDiffQty();

            totalOnHand += onHand;
            totalActual += counted;
            totalDiff += diff;

            if (diff > 0) {
                totalSurplus += diff;
            } else if (diff < 0) {
                totalMissing += diff;
            }
        }

        inventoryCount.setTotalOnHand(totalOnHand);
        inventoryCount.setTotalActualCount(totalActual);
        inventoryCount.setTotalSurplus(totalSurplus);
        inventoryCount.setTotalMissing(totalMissing);
        inventoryCount.setTotalDiffQty(totalDiff);
        inventoryCount.setTotalPriceActual(BigDecimal.ZERO);
    }

    private InventoryCountSummaryResponse buildSummary(InventoryCount inventoryCount) {
        int totalOnHand = 0;
        int totalActual = 0;
        int totalDiff = 0;
        int surplus = 0;
        int missing = 0;
        int matchedCount = 0;
        int unmatchedCount = 0;
        int notCountedCount = 0;

        for (InventoryCountItem item : inventoryCount.getItems()) {
            int onHand = item.getOnHand() != null ? item.getOnHand() : 0;
            int counted = item.getCounted() != null ? item.getCounted() : 0;
            int diff = counted - onHand;

            totalOnHand += onHand;
            totalActual += counted;
            totalDiff += diff;

            if (diff > 0) surplus += diff;
            if (diff < 0) missing += diff;
            if (counted == onHand) matchedCount++;
            else unmatchedCount++;
            if (counted == 0) notCountedCount++;
        }

        return InventoryCountSummaryResponse.builder()
                .surplusQty(surplus)
                .missingQty(missing)
                .totalDiffQty(totalDiff)
                .totalOnHand(totalOnHand)
                .allCount(inventoryCount.getItems().size())
                .matchedCount(matchedCount)
                .unmatchedCount(unmatchedCount)
                .notCountedCount(notCountedCount)
                .build();
    }

    private void recalculateItem(InventoryCountItem item) {
        int counted = item.getCounted() != null ? item.getCounted() : 0;
        int onHand = item.getOnHand() != null ? item.getOnHand() : 0;
        item.setDiffQty(counted - onHand);
        if (item.getDiffCost() == null) {
            item.setDiffCost(BigDecimal.ZERO);
        }
    }

    private void syncAllProductStocks(InventoryCount inventoryCount) {
        for (InventoryCountItem item : inventoryCount.getItems()) {
            syncProductStockIfActive(inventoryCount, item);
        }
    }

    private void syncProductStockIfActive(InventoryCount inventoryCount, InventoryCountItem item) {
        if (inventoryCount.getStatus() == InventoryCountStatus.DRAFT) {
            return;
        }
        int counted = item.getCounted() != null ? item.getCounted() : 0;
        productService.updateCurrentStock(item.getProductId(), counted);
    }
}
