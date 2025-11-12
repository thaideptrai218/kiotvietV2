package fa.academy.kiotviet.core.productcatalog.service;

import fa.academy.kiotviet.application.dto.productcatalog.request.BrandCreateRequest;
import fa.academy.kiotviet.application.dto.productcatalog.request.BrandUpdateRequest;
import fa.academy.kiotviet.application.dto.productcatalog.response.BrandAutocompleteItem;
import fa.academy.kiotviet.application.dto.productcatalog.response.BrandDto;
import fa.academy.kiotviet.core.productcatalog.domain.Brand;
import fa.academy.kiotviet.core.productcatalog.repository.BrandRepository;
import fa.academy.kiotviet.core.shared.exception.ResourceNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for Brand entities with comprehensive CRUD operations.
 * Supports multi-tenant architecture with company-level isolation.
 */
@Service
@RequiredArgsConstructor
public class BrandService {

    private final BrandRepository brandRepository;

    @Transactional
    public BrandDto create(Long companyId, BrandCreateRequest req) {
        // Validate unique constraints
        if (brandRepository.existsByCompany_IdAndNameIgnoreCase(companyId, req.getName())) {
            throw new IllegalArgumentException("Brand name already exists in this company");
        }

        Brand brand = Brand.builder()
                .company(fa.academy.kiotviet.core.tenant.domain.Company.builder().id(companyId).build())
                .name(req.getName())
                .description(req.getDescription())
                .website(req.getWebsite())
                .logoUrl(req.getLogoUrl())
                .isActive(req.getIsActive() != null ? req.getIsActive() : true)
                .build();

        Brand saved = brandRepository.save(brand);
        return toDto(saved);
    }

    @Transactional
    public BrandDto update(Long companyId, Long id, BrandUpdateRequest req) {
        Brand brand = brandRepository.findByIdAndCompany_Id(id, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found", "BRAND_NOT_FOUND"));

        // Validate name uniqueness if changed
        if (req.getName() != null && !req.getName().equalsIgnoreCase(brand.getName())) {
            if (brandRepository.existsByCompany_IdAndNameIgnoreCase(companyId, req.getName())) {
                throw new IllegalArgumentException("Brand name already exists in this company");
            }
            brand.setName(req.getName());
        }

        // Update fields
        if (req.getDescription() != null) brand.setDescription(req.getDescription());
        if (req.getWebsite() != null) brand.setWebsite(req.getWebsite());
        if (req.getLogoUrl() != null) brand.setLogoUrl(req.getLogoUrl());
        if (req.getIsActive() != null) brand.setIsActive(req.getIsActive());

        Brand saved = brandRepository.save(brand);
        return toDto(saved);
    }

    @Transactional
    public void softDelete(Long companyId, Long id) {
        Brand brand = brandRepository.findByIdAndCompany_Id(id, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found", "BRAND_NOT_FOUND"));
        brand.setIsActive(false);
        brandRepository.save(brand);
    }

    public BrandDto get(Long companyId, Long id) {
        Brand brand = brandRepository.findByIdAndCompany_Id(id, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Brand not found", "BRAND_NOT_FOUND"));
        return toDto(brand);
    }

    public Page<BrandDto> list(
            Long companyId,
            String search,
            Boolean active,
            Integer page,
            Integer size,
            String sortBy,
            String sortDir
    ) {
        Sort sort = Sort.by("desc".equalsIgnoreCase(sortDir) ? Sort.Direction.DESC : Sort.Direction.ASC,
                (sortBy == null || sortBy.isBlank()) ? "name" : sortBy);
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(size, 1), sort);

        Specification<Brand> spec = Specification.where(byCompany(companyId))
                .and(likeSearch(search))
                .and(eqActive(active));

        Page<Brand> result = brandRepository.findAll(spec, pageable);
        return result.map(this::toDto);
    }

    public List<BrandDto> findAllActive(Long companyId) {
        List<Brand> brands = brandRepository.findByCompany_IdAndIsActiveTrue(companyId);
        return brands.stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<BrandAutocompleteItem> autocomplete(Long companyId, String query, int limit) {
        int effectiveLimit = limit <= 0 ? 10 : Math.min(limit, 50);
        Pageable pageable = PageRequest.of(0, effectiveLimit, Sort.by("name").ascending());
        String q = query == null ? "" : query.trim();
        List<Brand> brands = brandRepository.autocompleteBrandNames(companyId, q, pageable);

        return brands.stream()
                .map(b -> BrandAutocompleteItem.builder()
                        .id(b.getId())
                        .name(b.getName())
                        .displayName(b.getDisplayName())
                        .isActive(b.getIsActive())
                        .website(b.getWebsite())
                        .build())
                .collect(Collectors.toList());
    }

    public List<BrandDto> findBrandsWithWebsite(Long companyId) {
        List<Brand> brands = brandRepository.findByCompany_IdAndWebsiteIsNotNullAndIsActiveTrue(companyId);
        return brands.stream().map(this::toDto).collect(Collectors.toList());
    }

    public List<BrandDto> findBrandsWithLogo(Long companyId) {
        List<Brand> brands = brandRepository.findByCompany_IdAndLogoUrlIsNotNullAndIsActiveTrue(companyId);
        return brands.stream().map(this::toDto).collect(Collectors.toList());
    }

    // Private helper methods
    private BrandDto toDto(Brand brand) {
        return BrandDto.builder()
                .id(brand.getId())
                .name(brand.getName())
                .description(brand.getDescription())
                .website(brand.getWebsite())
                .displayWebsite(brand.getDisplayWebsite())
                .logoUrl(brand.getLogoUrl())
                .isActive(brand.getIsActive())
                .hasLogo(brand.hasLogo())
                .hasWebsite(brand.hasWebsite())
                .isComplete(brand.isComplete())
                .createdAt(brand.getCreatedAt())
                .updatedAt(brand.getUpdatedAt())
                .build();
    }

    // Specification methods
    private Specification<Brand> byCompany(Long companyId) {
        return (root, query, cb) -> cb.equal(root.get("company").get("id"), companyId);
    }

    private Specification<Brand> likeSearch(String search) {
        if (search == null || search.isBlank()) return null;
        String pattern = "%" + search.toLowerCase() + "%";
        return (root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("name")), pattern),
                cb.like(cb.lower(root.get("description")), pattern)
        );
    }

    private Specification<Brand> eqActive(Boolean active) {
        if (active == null) return null;
        return (root, query, cb) -> cb.equal(root.get("isActive"), active);
    }
}