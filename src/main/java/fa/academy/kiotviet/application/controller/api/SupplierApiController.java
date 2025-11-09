package fa.academy.kiotviet.application.controller.api;

import fa.academy.kiotviet.application.dto.shared.PagedResponse;
import fa.academy.kiotviet.application.dto.shared.SuccessResponse;
import fa.academy.kiotviet.application.dto.supplier.request.SupplierCreateRequest;
import fa.academy.kiotviet.application.dto.supplier.request.SupplierUpdateRequest;
import fa.academy.kiotviet.application.dto.supplier.response.SupplierAutocompleteItem;
import fa.academy.kiotviet.application.dto.supplier.response.SupplierDto;
import fa.academy.kiotviet.application.service.ResponseFactory;
import fa.academy.kiotviet.core.suppliers.service.SupplierService;
import fa.academy.kiotviet.infrastructure.security.JwtAuthenticationFilter;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/suppliers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class SupplierApiController {

    private final SupplierService supplierService;

    // List suppliers with filters
    @GetMapping
    public SuccessResponse<PagedResponse<SupplierDto>> list(
        @RequestParam(required = false) String search,
        @RequestParam(required = false) String contact,
        @RequestParam(required = false) Boolean active,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(required = false) String sortBy,
        @RequestParam(required = false) String sortDir
    ) {
        Long companyId = currentCompanyId();
        PagedResponse<SupplierDto> data = supplierService.list(companyId, search, contact, active, page, size, sortBy, sortDir);
        return ResponseFactory.success(data, "Suppliers retrieved successfully");
    }

    // Advanced search alias
    @GetMapping("/search")
    public SuccessResponse<PagedResponse<SupplierDto>> search(
        @RequestParam(required = false) String search,
        @RequestParam(required = false) String contact,
        @RequestParam(required = false) Boolean active,
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(required = false) String sortBy,
        @RequestParam(required = false) String sortDir
    ) {
        return list(search, contact, active, page, size, sortBy, sortDir);
    }

    // Get details
    @GetMapping("/{id}")
    public SuccessResponse<SupplierDto> get(@PathVariable Long id) {
        Long companyId = currentCompanyId();
        SupplierDto data = supplierService.get(companyId, id);
        return ResponseFactory.success(data, "Supplier retrieved successfully");
    }

    // Create supplier
    @PostMapping
    public SuccessResponse<SupplierDto> create(@Valid @RequestBody SupplierCreateRequest request) {
        Long companyId = currentCompanyId();
        SupplierDto data = supplierService.create(companyId, request);
        return ResponseFactory.created(data, "Supplier created successfully");
    }

    // Update supplier
    @PutMapping("/{id}")
    public SuccessResponse<SupplierDto> update(@PathVariable Long id, @Valid @RequestBody SupplierUpdateRequest request) {
        Long companyId = currentCompanyId();
        SupplierDto data = supplierService.update(companyId, id, request);
        return ResponseFactory.success(data, "Supplier updated successfully");
    }

    // Soft delete supplier
    @DeleteMapping("/{id}")
    public SuccessResponse<String> delete(@PathVariable Long id) {
        Long companyId = currentCompanyId();
        supplierService.softDelete(companyId, id);
        return ResponseFactory.success("Supplier deleted successfully");
    }

    // Autocomplete endpoint
    @GetMapping("/autocomplete")
    public SuccessResponse<List<SupplierAutocompleteItem>> autocomplete(
        @RequestParam(name = "query") String query,
        @RequestParam(name = "limit", defaultValue = "10") int limit
    ) {
        Long companyId = currentCompanyId();
        List<SupplierAutocompleteItem> items = supplierService.autocomplete(companyId, query, limit);
        return ResponseFactory.success(items, "Suppliers autocomplete retrieved successfully");
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
