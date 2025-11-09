package fa.academy.kiotviet.core.suppliers.service;

import fa.academy.kiotviet.application.dto.shared.PagedResponse;
import fa.academy.kiotviet.application.dto.supplier.request.SupplierCreateRequest;
import fa.academy.kiotviet.application.dto.supplier.request.SupplierUpdateRequest;
import fa.academy.kiotviet.application.dto.supplier.response.SupplierAutocompleteItem;
import fa.academy.kiotviet.application.dto.supplier.response.SupplierDto;
import fa.academy.kiotviet.core.suppliers.domain.Supplier;
import fa.academy.kiotviet.core.suppliers.repository.SupplierRepository;
import fa.academy.kiotviet.core.tenant.domain.Company;
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
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;

    @Transactional
    public SupplierDto create(Long companyId, SupplierCreateRequest req) {
        // uniqueness per company
        if (supplierRepository.existsByCompany_IdAndNameIgnoreCase(companyId, req.getName())) {
            throw new IllegalArgumentException("Supplier name already exists in this company");
        }

        Supplier supplier = Supplier.builder()
            .company(Company.builder().id(companyId).build())
            .name(req.getName())
            .contactPerson(req.getContactPerson())
            .phone(req.getPhone())
            .email(req.getEmail())
            .address(req.getAddress())
            .isActive(true)
            .build();

        Supplier saved = supplierRepository.save(supplier);
        return toDto(saved);
    }

    @Transactional
    public SupplierDto update(Long companyId, Long id, SupplierUpdateRequest req) {
        Supplier supplier = supplierRepository.findByIdAndCompany_Id(id, companyId)
            .orElseThrow(() -> new ResourceNotFoundException("Supplier not found", "SUPPLIER_NOT_FOUND"));

        if (req.getName() != null && !req.getName().equalsIgnoreCase(supplier.getName())) {
            if (supplierRepository.existsByCompany_IdAndNameIgnoreCase(companyId, req.getName())) {
                throw new IllegalArgumentException("Supplier name already exists in this company");
            }
            supplier.setName(req.getName());
        }

        if (req.getContactPerson() != null) supplier.setContactPerson(req.getContactPerson());
        if (req.getPhone() != null) supplier.setPhone(req.getPhone());
        if (req.getEmail() != null) supplier.setEmail(req.getEmail());
        if (req.getAddress() != null) supplier.setAddress(req.getAddress());

        Supplier saved = supplierRepository.save(supplier);
        return toDto(saved);
    }

    @Transactional
    public void softDelete(Long companyId, Long id) {
        Supplier supplier = supplierRepository.findByIdAndCompany_Id(id, companyId)
            .orElseThrow(() -> new ResourceNotFoundException("Supplier not found", "SUPPLIER_NOT_FOUND"));
        supplier.setIsActive(false);
        supplierRepository.save(supplier);
    }

    public SupplierDto get(Long companyId, Long id) {
        Supplier supplier = supplierRepository.findByIdAndCompany_Id(id, companyId)
            .orElseThrow(() -> new ResourceNotFoundException("Supplier not found", "SUPPLIER_NOT_FOUND"));
        return toDto(supplier);
    }

    public PagedResponse<SupplierDto> list(
        Long companyId,
        String search,
        String contact,
        Boolean active,
        int page,
        int size,
        String sortBy,
        String sortDir
    ) {
        Sort sort = Sort.by(Objects.equals(sortDir, "desc") ? Sort.Direction.DESC : Sort.Direction.ASC,
            (sortBy == null || sortBy.isBlank()) ? "name" : sortBy);
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(size, 1), sort);

        Specification<Supplier> spec = Specification.where(byCompany(companyId))
            .and(likeAny(search))
            .and(likeContact(contact))
            .and(eqActive(active));

        Page<Supplier> result = supplierRepository.findAll(spec, pageable);
        List<SupplierDto> content = result.getContent().stream().map(this::toDto).collect(Collectors.toList());
        return PagedResponse.of(content, result.getNumber(), result.getSize(), result.getTotalElements());
    }

    public List<SupplierAutocompleteItem> autocomplete(Long companyId, String query, int limit) {
        int effectiveLimit = limit <= 0 ? 10 : Math.min(limit, 50);
        Pageable pageable = PageRequest.of(0, effectiveLimit, Sort.by("name").ascending());
        String q = query == null ? "" : query.trim();
        List<Supplier> suppliers = supplierRepository.searchAutocomplete(companyId, q, pageable);
        return suppliers.stream()
            .map(s -> new SupplierAutocompleteItem(s.getId(), buildDisplayName(s)))
            .collect(Collectors.toList());
    }

    private String buildDisplayName(Supplier s) {
        if (s.getContactPerson() == null || s.getContactPerson().isBlank()) {
            return s.getName();
        }
        return s.getName() + " (" + s.getContactPerson() + ")";
    }

    private Specification<Supplier> byCompany(Long companyId) {
        return (root, query, cb) -> cb.equal(root.get("company").get("id"), companyId);
    }

    private Specification<Supplier> likeAny(String search) {
        if (search == null || search.isBlank()) return null;
        String pattern = "%" + search.toLowerCase() + "%";
        return (root, query, cb) -> cb.or(
            cb.like(cb.lower(root.get("name")), pattern),
            cb.like(cb.lower(root.get("contactPerson")), pattern)
        );
    }

    private Specification<Supplier> likeContact(String contact) {
        if (contact == null || contact.isBlank()) return null;
        String pattern = "%" + contact.toLowerCase() + "%";
        return (root, query, cb) -> cb.like(cb.lower(root.get("contactPerson")), pattern);
    }

    private Specification<Supplier> eqActive(Boolean active) {
        if (active == null) return null;
        return (root, query, cb) -> cb.equal(root.get("isActive"), active);
    }

    private SupplierDto toDto(Supplier s) {
        return SupplierDto.builder()
            .id(s.getId())
            .name(s.getName())
            .contactPerson(s.getContactPerson())
            .phone(s.getPhone())
            .email(s.getEmail())
            .address(s.getAddress())
            .isActive(s.getIsActive())
            .createdAt(s.getCreatedAt())
            .updatedAt(s.getUpdatedAt())
            .build();
    }
}
