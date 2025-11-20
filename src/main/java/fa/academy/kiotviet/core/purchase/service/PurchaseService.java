package fa.academy.kiotviet.core.purchase.service;

import fa.academy.kiotviet.application.dto.purchase.request.*;
import fa.academy.kiotviet.application.dto.purchase.response.PurchaseDto;
import fa.academy.kiotviet.core.productcatalog.domain.Product;
import fa.academy.kiotviet.core.productcatalog.repository.ProductRepository;
import fa.academy.kiotviet.core.purchase.domain.PurchaseEntry;
import fa.academy.kiotviet.core.purchase.domain.PurchaseEntryLine;
import fa.academy.kiotviet.core.purchase.domain.PurchasePayment;
import fa.academy.kiotviet.core.purchase.repository.PurchaseEntryRepository;
import fa.academy.kiotviet.core.purchase.repository.PurchasePaymentRepository;
import fa.academy.kiotviet.core.shared.exception.ResourceNotFoundException;
import fa.academy.kiotviet.core.suppliers.domain.Supplier;
import fa.academy.kiotviet.core.suppliers.repository.SupplierRepository;
import fa.academy.kiotviet.core.tenant.domain.Company;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PurchaseService {

    private final PurchaseEntryRepository purchaseEntryRepository;
    private final PurchasePaymentRepository purchasePaymentRepository;
    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;

    @Transactional
    public PurchaseDto create(Long companyId, PurchaseCreateRequest req) {
        Supplier supplier = supplierRepository.findByIdAndCompany_Id(req.getSupplierId(), companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found", "SUPPLIER_NOT_FOUND"));

        PurchaseEntry entry = PurchaseEntry.builder()
                .company(Company.builder().id(companyId).build())
                .supplier(supplier)
                .billDate(Objects.requireNonNullElseGet(req.getBillDate(), java.time.LocalDate::now))
                .dueDate(req.getDueDate())
                .referenceNo(req.getReferenceNo())
                .notes(req.getNotes())
                .discountTotal(nvl(req.getDiscountTotal()))
                .supplierExpense(nvl(req.getSupplierExpense()))
                .otherExpense(nvl(req.getOtherExpense()))
                .amountPaid(nvl(req.getAmountPaid()))
                .status(PurchaseEntry.Status.DRAFT)
                .build();

        if (req.getLines() == null || req.getLines().isEmpty()) {
            throw new IllegalArgumentException("At least one line is required");
        }

        for (PurchaseLineRequest lr : req.getLines()) {
            Product product = productRepository.findByIdAndCompany_Id(lr.getProductId(), companyId)
                    .orElseThrow(() -> new ResourceNotFoundException("Product not found", "PRODUCT_NOT_FOUND"));
            PurchaseEntryLine line = PurchaseEntryLine.builder()
                    .company(Company.builder().id(companyId).build())
                    .purchaseEntry(entry)
                    .product(product)
                    .description(lr.getDescription())
                    .qtyOrdered(nvlInt(lr.getQtyOrdered()))
                    .qtyReceived(0)
                    .unitCost(Objects.requireNonNull(lr.getUnitCost(), "unitCost is required"))
                    .discountAmount(nvl(lr.getDiscountAmount()))
                    .taxPercent(nvl(lr.getTaxPercent()))
                    .build();
            // compute per-line total for reporting
            line.setLineTotal(calcLineTotal(line));
            entry.getLines().add(line);
        }

        // compute header totals
        recomputeTotals(entry);
        // amountDue initial
        entry.setAmountDue(entry.getGrandTotal().subtract(nvl(req.getAmountPaid())));

        PurchaseEntry saved = purchaseEntryRepository.save(entry);

        // initial payment record if > 0
        if (nvl(req.getAmountPaid()).compareTo(BigDecimal.ZERO) > 0) {
            PurchasePayment p = PurchasePayment.builder()
                    .company(Company.builder().id(companyId).build())
                    .purchaseEntry(saved)
                    .method("CASH")
                    .amount(nvl(req.getAmountPaid()))
                    .reference("INIT")
                    .note("Initial payment")
                    .build();
            purchasePaymentRepository.save(p);
        }

        return toDto(saved);
    }

    @Transactional
    public PurchaseDto update(Long companyId, Long id, PurchaseUpdateRequest req) {
        PurchaseEntry entry = purchaseEntryRepository.findByIdAndCompany_Id(id, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase not found", "PURCHASE_NOT_FOUND"));

        // Allow edits in DRAFT or CONFIRMED (but not if any quantity has been received)
        if (entry.getStatus() == PurchaseEntry.Status.RECEIVED || entry.getStatus() == PurchaseEntry.Status.CANCELLED) {
            throw new IllegalStateException("Cannot update a completed or cancelled entry");
        }
        if (entry.getStatus() == PurchaseEntry.Status.CONFIRMED && entry.isAnyReceived()) {
            throw new IllegalStateException("Cannot update after items have been received");
        }

        if (req.getNotes() != null) entry.setNotes(req.getNotes());
        if (req.getDiscountTotal() != null) entry.setDiscountTotal(nvl(req.getDiscountTotal()));
        if (req.getSupplierExpense() != null) entry.setSupplierExpense(nvl(req.getSupplierExpense()));
        if (req.getOtherExpense() != null) entry.setOtherExpense(nvl(req.getOtherExpense()));

        if (req.getLines() != null) {
            // Map existing lines by id
            java.util.Map<Long, PurchaseEntryLine> existing = entry.getLines().stream()
                    .filter(l -> l.getId() != null)
                    .collect(java.util.stream.Collectors.toMap(PurchaseEntryLine::getId, l -> l));
            for (PurchaseLineRequest lr : req.getLines()) {
                if (lr.getId() != null && existing.containsKey(lr.getId())) {
                    PurchaseEntryLine line = existing.get(lr.getId());
                    if (lr.getDescription() != null) line.setDescription(lr.getDescription());
                    if (lr.getQtyOrdered() != null) line.setQtyOrdered(nvlInt(lr.getQtyOrdered()));
                    if (lr.getUnitCost() != null) line.setUnitCost(lr.getUnitCost());
                    if (lr.getDiscountAmount() != null) line.setDiscountAmount(nvl(lr.getDiscountAmount()));
                    if (lr.getTaxPercent() != null) line.setTaxPercent(nvl(lr.getTaxPercent()));
                    line.setLineTotal(calcLineTotal(line));
                } else {
                    // new line
                    if (lr.getProductId() == null) continue;
                    Product product = productRepository.findByIdAndCompany_Id(lr.getProductId(), companyId)
                            .orElseThrow(() -> new ResourceNotFoundException("Product not found", "PRODUCT_NOT_FOUND"));
                    PurchaseEntryLine line = PurchaseEntryLine.builder()
                            .company(Company.builder().id(companyId).build())
                            .purchaseEntry(entry)
                            .product(product)
                            .description(lr.getDescription())
                            .qtyOrdered(nvlInt(lr.getQtyOrdered()))
                            .qtyReceived(0)
                            .unitCost(Objects.requireNonNullElse(lr.getUnitCost(), BigDecimal.ZERO))
                            .discountAmount(nvl(lr.getDiscountAmount()))
                            .taxPercent(nvl(lr.getTaxPercent()))
                            .build();
                    line.setLineTotal(calcLineTotal(line));
                    entry.getLines().add(line);
                }
            }
        }

        // Recompute totals and adjust supplier outstanding if already confirmed
        java.math.BigDecimal oldAmountDue = entry.getAmountDue() == null ? java.math.BigDecimal.ZERO : entry.getAmountDue();
        recomputeTotals(entry);
        entry.setAmountDue(entry.getGrandTotal().subtract(entry.getAmountPaid()));

        if (entry.getStatus() == PurchaseEntry.Status.CONFIRMED) {
            java.math.BigDecimal delta = entry.getAmountDue().subtract(oldAmountDue);
            if (delta.compareTo(java.math.BigDecimal.ZERO) != 0) {
                Supplier supplier = entry.getSupplier();
                if (supplier.getOutstandingBalance() == null) supplier.setOutstandingBalance(java.math.BigDecimal.ZERO);
                supplier.setOutstandingBalance(supplier.getOutstandingBalance().add(delta));
                supplierRepository.save(supplier);
            }
        }

        PurchaseEntry saved = purchaseEntryRepository.save(entry);
        return toDto(saved);
    }

    @Transactional
    public PurchaseDto confirm(Long companyId, Long id, PurchaseConfirmRequest req) {
        PurchaseEntry entry = purchaseEntryRepository.findByIdAndCompany_Id(id, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase not found", "PURCHASE_NOT_FOUND"));
        if (entry.getStatus() != PurchaseEntry.Status.DRAFT) {
            throw new IllegalStateException("Only DRAFT entries can be confirmed");
        }
        // totals must be fresh
        recomputeTotals(entry);

        BigDecimal addPayment = nvl(req.getAmountPaid());
        if (addPayment.compareTo(BigDecimal.ZERO) > 0) {
            entry.setAmountPaid(entry.getAmountPaid().add(addPayment));
            PurchasePayment p = PurchasePayment.builder()
                    .company(Company.builder().id(companyId).build())
                    .purchaseEntry(entry)
                    .method(req.getPaymentMethod() == null ? "CASH" : req.getPaymentMethod())
                    .amount(addPayment)
                    .reference(req.getReference())
                    .note("Payment on confirm")
                    .build();
            purchasePaymentRepository.save(p);
        }
        entry.setAmountDue(entry.getGrandTotal().subtract(entry.getAmountPaid()));

        // increase supplier outstanding by amountDue
        Supplier supplier = entry.getSupplier();
        if (supplier.getOutstandingBalance() == null) supplier.setOutstandingBalance(BigDecimal.ZERO);
        supplier.setOutstandingBalance(supplier.getOutstandingBalance().add(entry.getAmountDue()));
        supplierRepository.save(supplier);

        entry.setStatus(PurchaseEntry.Status.CONFIRMED);
        PurchaseEntry saved = purchaseEntryRepository.save(entry);
        return toDto(saved);
    }

    @Transactional
    public PurchaseDto receive(Long companyId, Long id, PurchaseReceiveRequest req) {
        PurchaseEntry entry = purchaseEntryRepository.findByIdAndCompany_Id(id, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase not found", "PURCHASE_NOT_FOUND"));
        if (entry.getStatus() != PurchaseEntry.Status.CONFIRMED && entry.getStatus() != PurchaseEntry.Status.PARTIALLY_RECEIVED) {
            throw new IllegalStateException("Only CONFIRMED or PARTIALLY_RECEIVED entries can be received");
        }
        java.util.Map<Long, PurchaseEntryLine> byId = entry.getLines().stream()
                .collect(Collectors.toMap(PurchaseEntryLine::getId, l -> l));
        for (PurchaseReceiveRequest.ReceiveLine rl : req.getLines()) {
            PurchaseEntryLine line = byId.get(rl.getId());
            if (line == null) throw new ResourceNotFoundException("Purchase line not found", "PURCHASE_LINE_NOT_FOUND");
            int add = rl.getQtyReceived() == null ? 0 : Math.max(0, rl.getQtyReceived());
            int current = line.getQtyReceived() == null ? 0 : line.getQtyReceived();
            int ordered = line.getQtyOrdered() == null ? 0 : line.getQtyOrdered();
            if (current + add > ordered) {
                throw new IllegalArgumentException("Receiving quantity exceeds ordered amount");
            }
            if (add > 0) {
                line.setQtyReceived(current + add);
                // increment product stock
                Product prod = line.getProduct();
                prod.setOnHand((prod.getOnHand() == null ? 0 : prod.getOnHand()) + add);
                productRepository.save(prod);
            }
        }

        // update status
        if (entry.isFullyReceived()) {
            entry.setStatus(PurchaseEntry.Status.RECEIVED);
        } else {
            entry.setStatus(PurchaseEntry.Status.PARTIALLY_RECEIVED);
        }
        PurchaseEntry saved = purchaseEntryRepository.save(entry);
        return toDto(saved);
    }

    @Transactional
    public PurchaseDto addPayment(Long companyId, Long id, PurchasePaymentRequest req) {
        PurchaseEntry entry = purchaseEntryRepository.findByIdAndCompany_Id(id, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase not found", "PURCHASE_NOT_FOUND"));
        if (entry.getStatus() == PurchaseEntry.Status.CANCELLED) {
            throw new IllegalStateException("Cannot pay a cancelled entry");
        }
        BigDecimal amount = Objects.requireNonNull(nvl(req.getAmount()));
        if (amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Payment amount must be > 0");
        }
        PurchasePayment p = PurchasePayment.builder()
                .company(Company.builder().id(companyId).build())
                .purchaseEntry(entry)
                .amount(amount)
                .method(req.getMethod() == null ? "CASH" : req.getMethod())
                .reference(req.getReference())
                .note(req.getNote())
                .build();
        purchasePaymentRepository.save(p);

        entry.setAmountPaid(entry.getAmountPaid().add(amount));
        entry.setAmountDue(entry.getGrandTotal().subtract(entry.getAmountPaid()));
        if (entry.getAmountDue().compareTo(BigDecimal.ZERO) < 0) entry.setAmountDue(BigDecimal.ZERO);

        // reduce supplier outstanding
        Supplier supplier = entry.getSupplier();
        if (supplier.getOutstandingBalance() == null) supplier.setOutstandingBalance(BigDecimal.ZERO);
        supplier.setOutstandingBalance(supplier.getOutstandingBalance().subtract(amount));
        if (supplier.getOutstandingBalance().compareTo(BigDecimal.ZERO) < 0) supplier.setOutstandingBalance(BigDecimal.ZERO);
        supplierRepository.save(supplier);

        PurchaseEntry saved = purchaseEntryRepository.save(entry);
        return toDto(saved);
    }

    @Transactional
    public PurchaseDto cancel(Long companyId, Long id) {
        PurchaseEntry entry = purchaseEntryRepository.findByIdAndCompany_Id(id, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase not found", "PURCHASE_NOT_FOUND"));
        if (entry.getStatus() == PurchaseEntry.Status.RECEIVED || entry.getStatus() == PurchaseEntry.Status.PARTIALLY_RECEIVED) {
            throw new IllegalStateException("Cannot cancel an entry with received items");
        }
        if (entry.getStatus() == PurchaseEntry.Status.CONFIRMED && entry.getAmountDue() != null && entry.getAmountDue().compareTo(BigDecimal.ZERO) > 0) {
            // reverse outstanding
            Supplier supplier = entry.getSupplier();
            if (supplier.getOutstandingBalance() == null) supplier.setOutstandingBalance(BigDecimal.ZERO);
            supplier.setOutstandingBalance(supplier.getOutstandingBalance().subtract(entry.getAmountDue()));
            if (supplier.getOutstandingBalance().compareTo(BigDecimal.ZERO) < 0) supplier.setOutstandingBalance(BigDecimal.ZERO);
            supplierRepository.save(supplier);
            entry.setAmountDue(BigDecimal.ZERO);
        }
        entry.setStatus(PurchaseEntry.Status.CANCELLED);
        PurchaseEntry saved = purchaseEntryRepository.save(entry);
        return toDto(saved);
    }

    public PurchaseDto get(Long companyId, Long id) {
        PurchaseEntry entry = purchaseEntryRepository.findByIdAndCompany_Id(id, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase not found", "PURCHASE_NOT_FOUND"));
        return toDto(entry);
    }

    public Page<PurchaseDto> list(Long companyId, String search, PurchaseEntry.Status status, Long supplierId,
                                  java.time.LocalDate from, java.time.LocalDate to,
                                  int page, int size, String sortBy, String sortDir) {
        Sort sort = Sort.by("desc".equalsIgnoreCase(sortDir) ? Sort.Direction.DESC : Sort.Direction.ASC,
                (sortBy == null || sortBy.isBlank()) ? "billDate" : sortBy);
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(size, 1), sort);

        Specification<PurchaseEntry> spec = Specification.where(byCompany(companyId))
                .and(likeSearch(search))
                .and(eqStatus(status))
                .and(eqSupplier(supplierId))
                .and(betweenDates(from, to));

        return purchaseEntryRepository.findAll(spec, pageable).map(this::toDto);
    }

    // Helpers
    private void recomputeTotals(PurchaseEntry entry) {
        BigDecimal subtotal = BigDecimal.ZERO;
        BigDecimal lineDiscounts = BigDecimal.ZERO;
        BigDecimal taxTotal = BigDecimal.ZERO;
        for (PurchaseEntryLine l : entry.getLines()) {
            BigDecimal qty = BigDecimal.valueOf(l.getQtyOrdered() == null ? 0 : l.getQtyOrdered());
            BigDecimal lineSub = l.getUnitCost().multiply(qty);
            BigDecimal disc = nvl(l.getDiscountAmount());
            BigDecimal baseForTax = lineSub.subtract(disc);
            BigDecimal tax = baseForTax.multiply(nvl(l.getTaxPercent()).movePointLeft(2));
            tax = tax.setScale(2, RoundingMode.HALF_UP);
            l.setLineTotal(lineSub.subtract(disc).add(tax));

            subtotal = subtotal.add(lineSub);
            lineDiscounts = lineDiscounts.add(disc);
            taxTotal = taxTotal.add(tax);
        }
        entry.setSubtotal(subtotal.setScale(2, RoundingMode.HALF_UP));
        BigDecimal headerDiscount = nvl(entry.getDiscountTotal());
        entry.setDiscountTotal(headerDiscount.add(lineDiscounts).setScale(2, RoundingMode.HALF_UP));
        entry.setTaxTotal(taxTotal.setScale(2, RoundingMode.HALF_UP));
        BigDecimal grand = entry.getSubtotal()
                .subtract(entry.getDiscountTotal())
                .add(nvl(entry.getTaxTotal()))
                .add(nvl(entry.getSupplierExpense()))
                .add(nvl(entry.getOtherExpense()));
        entry.setGrandTotal(grand.max(BigDecimal.ZERO).setScale(2, RoundingMode.HALF_UP));
        if (entry.getAmountPaid() == null) entry.setAmountPaid(BigDecimal.ZERO);
        entry.setAmountDue(entry.getGrandTotal().subtract(entry.getAmountPaid()).max(BigDecimal.ZERO));
    }

    private BigDecimal calcLineTotal(PurchaseEntryLine l) {
        BigDecimal qty = BigDecimal.valueOf(l.getQtyOrdered() == null ? 0 : l.getQtyOrdered());
        BigDecimal sub = l.getUnitCost().multiply(qty);
        BigDecimal disc = nvl(l.getDiscountAmount());
        BigDecimal tax = sub.subtract(disc).multiply(nvl(l.getTaxPercent()).movePointLeft(2));
        return sub.subtract(disc).add(tax).setScale(2, RoundingMode.HALF_UP);
    }

    private BigDecimal nvl(BigDecimal v) { return v == null ? BigDecimal.ZERO : v; }
    private int nvlInt(Integer v) { return v == null ? 0 : v; }

    // Specifications
    private Specification<PurchaseEntry> byCompany(Long companyId) {
        return (root, query, cb) -> cb.equal(root.get("company").get("id"), companyId);
    }
    private Specification<PurchaseEntry> eqStatus(PurchaseEntry.Status status) {
        if (status == null) return null;
        return (root, query, cb) -> cb.equal(root.get("status"), status);
    }
    private Specification<PurchaseEntry> eqSupplier(Long supplierId) {
        if (supplierId == null) return null;
        return (root, query, cb) -> cb.equal(root.get("supplier").get("id"), supplierId);
    }
    private Specification<PurchaseEntry> likeSearch(String q) {
        if (q == null || q.isBlank()) return null;
        String pattern = "%" + q.toLowerCase() + "%";
        return (root, query, cb) -> {
            var supplierJoin = root.join("supplier", jakarta.persistence.criteria.JoinType.LEFT);
            return cb.or(
                    cb.like(cb.lower(root.get("code")), pattern),
                    cb.like(cb.lower(root.get("referenceNo")), pattern),
                    cb.like(cb.lower(supplierJoin.get("name")), pattern)
            );
        };
    }
    private Specification<PurchaseEntry> betweenDates(java.time.LocalDate from, java.time.LocalDate to) {
        if (from == null && to == null) return null;
        return (root, query, cb) -> {
            if (from != null && to != null) {
                return cb.between(root.get("billDate"), from, to);
            } else if (from != null) {
                return cb.greaterThanOrEqualTo(root.get("billDate"), from);
            } else {
                return cb.lessThanOrEqualTo(root.get("billDate"), to);
            }
        };
    }

    // Mapping
    private PurchaseDto toDto(PurchaseEntry e) {
        return PurchaseDto.builder()
                .id(e.getId())
                .code(e.getCode())
                .supplierId(e.getSupplier() != null ? e.getSupplier().getId() : null)
                .supplierName(e.getSupplier() != null ? e.getSupplier().getName() : null)
                .status(e.getStatus())
                .billDate(e.getBillDate())
                .dueDate(e.getDueDate())
                .referenceNo(e.getReferenceNo())
                .notes(e.getNotes())
                .currency(e.getCurrency())
                .subtotal(e.getSubtotal())
                .discountTotal(e.getDiscountTotal())
                .taxTotal(e.getTaxTotal())
                .supplierExpense(e.getSupplierExpense())
                .otherExpense(e.getOtherExpense())
                .grandTotal(e.getGrandTotal())
                .amountPaid(e.getAmountPaid())
                .amountDue(e.getAmountDue())
                .createdAt(e.getCreatedAt())
                .updatedAt(e.getUpdatedAt())
                .lines(e.getLines() == null ? java.util.List.of() : e.getLines().stream().map(l ->
                        PurchaseDto.PurchaseLineDto.builder()
                                .id(l.getId())
                                .productId(l.getProduct() != null ? l.getProduct().getId() : null)
                                .productName(l.getProduct() != null ? l.getProduct().getName() : null)
                                .description(l.getDescription())
                                .qtyOrdered(l.getQtyOrdered())
                                .qtyReceived(l.getQtyReceived())
                                .unitCost(l.getUnitCost())
                                .discountAmount(l.getDiscountAmount())
                                .taxPercent(l.getTaxPercent())
                                .lineTotal(l.getLineTotal())
                                .build()
                ).collect(Collectors.toList()))
                .payments(e.getPayments() == null ? java.util.List.of() : e.getPayments().stream().map(p ->
                        PurchaseDto.PurchasePaymentDto.builder()
                                .id(p.getId())
                                .paidAt(p.getPaidAt())
                                .method(p.getMethod())
                                .amount(p.getAmount())
                                .reference(p.getReference())
                                .note(p.getNote())
                                .build()
                ).collect(Collectors.toList()))
                .build();
    }
}
