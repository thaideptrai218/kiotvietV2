package fa.academy.kiotviet.application.controller.api;

import fa.academy.kiotviet.application.dto.shared.SuccessResponse;
import fa.academy.kiotviet.application.dto.productcatalog.request.BrandCreateRequest;
import fa.academy.kiotviet.application.dto.productcatalog.request.BrandUpdateRequest;
import fa.academy.kiotviet.application.dto.productcatalog.response.BrandAutocompleteItem;
import fa.academy.kiotviet.application.dto.productcatalog.response.BrandDto;
import fa.academy.kiotviet.application.service.ResponseFactory;
import fa.academy.kiotviet.core.productcatalog.service.BrandService;
import fa.academy.kiotviet.infrastructure.security.JwtAuthenticationFilter;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST API controller for brand management.
 * Provides endpoints for CRUD operations and brand information management.
 */
@RestController
@RequestMapping("/api/brands")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class BrandController {

    private final BrandService brandService;

    /**
     * Get brands with pagination, filtering, and sorting
     */
    @GetMapping
    public SuccessResponse<Page<BrandDto>> listBrands(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean active,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Long companyId = currentCompanyId();
        Page<BrandDto> brands = brandService.list(
                companyId, search, active, page, size, sortBy, sortDir);

        return ResponseFactory.success(brands, "Brands retrieved successfully");
    }

    /**
     * Get a single brand by ID
     */
    @GetMapping("/{id}")
    public SuccessResponse<BrandDto> getBrand(@PathVariable Long id) {
        Long companyId = currentCompanyId();
        BrandDto brand = brandService.get(companyId, id);
        return ResponseFactory.success(brand, "Brand retrieved successfully");
    }

    /**
     * Create a new brand
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER') or hasAuthority('PRODUCT_MANAGE')")
    public SuccessResponse<BrandDto> createBrand(@Valid @RequestBody BrandCreateRequest request) {
        Long companyId = currentCompanyId();
        BrandDto brand = brandService.create(companyId, request);
        return ResponseFactory.created(brand, "Brand created successfully");
    }

    /**
     * Update an existing brand
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER') or hasAuthority('PRODUCT_MANAGE')")
    public SuccessResponse<BrandDto> updateBrand(
            @PathVariable Long id,
            @Valid @RequestBody BrandUpdateRequest request) {

        Long companyId = currentCompanyId();
        BrandDto brand = brandService.update(companyId, id, request);
        return ResponseFactory.success(brand, "Brand updated successfully");
    }

    /**
     * Soft delete a brand (mark as inactive)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER') or hasAuthority('PRODUCT_MANAGE')")
    public SuccessResponse<String> deleteBrand(@PathVariable Long id) {
        Long companyId = currentCompanyId();
        brandService.softDelete(companyId, id);
        return ResponseFactory.success("Brand deleted successfully");
    }

    /**
     * Get all active brands (no pagination)
     */
    @GetMapping("/active")
    public SuccessResponse<List<BrandDto>> getActiveBrands() {
        Long companyId = currentCompanyId();
        List<BrandDto> brands = brandService.findAllActive(companyId);
        return ResponseFactory.success(brands, "Active brands retrieved successfully");
    }

    /**
     * Search brands for autocomplete functionality
     */
    @GetMapping("/autocomplete")
    public SuccessResponse<List<BrandAutocompleteItem>> autocompleteBrands(
            @RequestParam String query,
            @RequestParam(defaultValue = "10") int limit) {

        Long companyId = currentCompanyId();
        List<BrandAutocompleteItem> brands = brandService.autocomplete(companyId, query, limit);
        return ResponseFactory.success(brands, "Brand autocomplete results");
    }

    /**
     * Get brands that have website information
     */
    @GetMapping("/with-website")
    public SuccessResponse<List<BrandDto>> getBrandsWithWebsite() {
        Long companyId = currentCompanyId();
        List<BrandDto> brands = brandService.findBrandsWithWebsite(companyId);
        return ResponseFactory.success(brands, "Brands with website retrieved");
    }

    /**
     * Get brands that have logo images
     */
    @GetMapping("/with-logo")
    public SuccessResponse<List<BrandDto>> getBrandsWithLogo() {
        Long companyId = currentCompanyId();
        List<BrandDto> brands = brandService.findBrandsWithLogo(companyId);
        return ResponseFactory.success(brands, "Brands with logo retrieved");
    }

    /**
     * Get active brands only (alias for /active endpoint)
     */
    @GetMapping("/active/list")
    public SuccessResponse<List<BrandDto>> getActiveBrandsList() {
        Long companyId = currentCompanyId();
        List<BrandDto> brands = brandService.findAllActive(companyId);
        return ResponseFactory.success(brands, "Active brands list retrieved");
    }

    // Helper method
    private Long currentCompanyId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !(auth.getPrincipal() instanceof JwtAuthenticationFilter.UserPrincipal)) {
            throw new IllegalStateException("No authenticated user found");
        }
        JwtAuthenticationFilter.UserPrincipal principal = (JwtAuthenticationFilter.UserPrincipal) auth.getPrincipal();
        return principal.getCompanyId();
    }
}