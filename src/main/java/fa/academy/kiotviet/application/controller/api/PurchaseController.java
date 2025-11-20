package fa.academy.kiotviet.application.controller.api;

import fa.academy.kiotviet.application.dto.purchase.request.*;
import fa.academy.kiotviet.application.dto.purchase.response.PurchaseDto;
import fa.academy.kiotviet.application.dto.shared.SuccessResponse;
import fa.academy.kiotviet.application.service.ResponseFactory;
import fa.academy.kiotviet.core.purchase.domain.PurchaseEntry;
import fa.academy.kiotviet.core.purchase.service.PurchaseService;
import fa.academy.kiotviet.infrastructure.security.JwtAuthenticationFilter;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/purchases")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class PurchaseController {

    private final PurchaseService purchaseService;

    @PostMapping
    public SuccessResponse<PurchaseDto> create(@Valid @RequestBody PurchaseCreateRequest request) {
        Long companyId = currentCompanyId();
        PurchaseDto dto = purchaseService.create(companyId, request);
        return ResponseFactory.created(dto, "Purchase created successfully");
    }

    @PutMapping("/{id}")
    public SuccessResponse<PurchaseDto> update(@PathVariable Long id, @Valid @RequestBody PurchaseUpdateRequest request) {
        Long companyId = currentCompanyId();
        PurchaseDto dto = purchaseService.update(companyId, id, request);
        return ResponseFactory.success(dto, "Purchase updated successfully");
    }

    @PostMapping("/{id}/confirm")
    public SuccessResponse<PurchaseDto> confirm(@PathVariable Long id, @RequestBody PurchaseConfirmRequest request) {
        Long companyId = currentCompanyId();
        PurchaseDto dto = purchaseService.confirm(companyId, id, request);
        return ResponseFactory.success(dto, "Purchase confirmed successfully");
    }

    @PostMapping("/{id}/receive")
    public SuccessResponse<PurchaseDto> receive(@PathVariable Long id, @RequestBody PurchaseReceiveRequest request) {
        Long companyId = currentCompanyId();
        PurchaseDto dto = purchaseService.receive(companyId, id, request);
        return ResponseFactory.success(dto, "Purchase received successfully");
    }

    @PostMapping("/{id}/payments")
    public SuccessResponse<PurchaseDto> addPayment(@PathVariable Long id, @RequestBody PurchasePaymentRequest request) {
        Long companyId = currentCompanyId();
        PurchaseDto dto = purchaseService.addPayment(companyId, id, request);
        return ResponseFactory.success(dto, "Payment recorded successfully");
    }

    @PostMapping("/{id}/cancel")
    public SuccessResponse<PurchaseDto> cancel(@PathVariable Long id) {
        Long companyId = currentCompanyId();
        PurchaseDto dto = purchaseService.cancel(companyId, id);
        return ResponseFactory.success(dto, "Purchase cancelled successfully");
    }

    @GetMapping
    public SuccessResponse<Page<PurchaseDto>> list(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) PurchaseEntry.Status status,
            @RequestParam(required = false) Long supplierId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "billDate") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        Long companyId = currentCompanyId();
        Page<PurchaseDto> data = purchaseService.list(companyId, search, status, supplierId, from, to, page, size, sortBy, sortDir);
        return ResponseFactory.success(data, "Purchases retrieved successfully");
    }

    @GetMapping("/{id}")
    public SuccessResponse<PurchaseDto> get(@PathVariable Long id) {
        Long companyId = currentCompanyId();
        PurchaseDto dto = purchaseService.get(companyId, id);
        return ResponseFactory.success(dto, "Purchase retrieved successfully");
    }

    private Long currentCompanyId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof JwtAuthenticationFilter.UserPrincipal)) {
            throw new IllegalStateException("No authenticated user found");
        }
        JwtAuthenticationFilter.UserPrincipal principal = (JwtAuthenticationFilter.UserPrincipal) auth.getPrincipal();
        return principal.getCompanyId();
    }
}
