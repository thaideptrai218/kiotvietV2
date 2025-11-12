package fa.academy.kiotviet.core.suppliers.service;

import fa.academy.kiotviet.application.dto.shared.PagedResponse;
import fa.academy.kiotviet.application.dto.supplier.request.SupplierCreateRequest;
import fa.academy.kiotviet.application.dto.supplier.request.SupplierUpdateRequest;
import fa.academy.kiotviet.application.dto.supplier.response.SupplierAutocompleteItem;
import fa.academy.kiotviet.application.dto.supplier.response.SupplierDto;
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
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Objects;
import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SupplierService {

    private final SupplierRepository supplierRepository;

    @Transactional
    public SupplierDto create(Long companyId, SupplierCreateRequest req) {
        if (supplierRepository.existsByCompany_IdAndNameIgnoreCase(companyId, req.getName())) {
            throw new IllegalArgumentException("Supplier name already exists in this company");
        }
        if (req.getTaxCode() != null && !req.getTaxCode().isBlank()) {
            if (supplierRepository.existsByCompany_IdAndTaxCodeIgnoreCase(companyId, req.getTaxCode())) {
                throw new IllegalArgumentException("Supplier tax code already exists in this company");
            }
        }

        Supplier supplier = Supplier.builder()
                .company(Company.builder().id(companyId).build())
                .name(req.getName())
                .contactPerson(req.getContactPerson())
                .phone(req.getPhone())
                .email(req.getEmail())
                .address(req.getAddress())
                .taxCode(req.getTaxCode())
                .website(req.getWebsite())
                .notes(req.getNotes())
                .outstandingBalance(java.math.BigDecimal.ZERO)
                .lastPaymentDate(null)
                .creditLimit(req.getCreditLimit() == null ? java.math.BigDecimal.ZERO : req.getCreditLimit())
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

        if (req.getContactPerson() != null)
            supplier.setContactPerson(req.getContactPerson());
        if (req.getPhone() != null)
            supplier.setPhone(req.getPhone());
        if (req.getEmail() != null)
            supplier.setEmail(req.getEmail());
        if (req.getAddress() != null)
            supplier.setAddress(req.getAddress());
        if (req.getTaxCode() != null
                && !req.getTaxCode().equalsIgnoreCase(supplier.getTaxCode() == null ? "" : supplier.getTaxCode())) {
            if (req.getTaxCode().isBlank()) {
                supplier.setTaxCode(null);
            } else {
                if (supplierRepository.existsByCompany_IdAndTaxCodeIgnoreCase(companyId, req.getTaxCode())) {
                    throw new IllegalArgumentException("Supplier tax code already exists in this company");
                }
                supplier.setTaxCode(req.getTaxCode());
            }
        }
        if (req.getWebsite() != null)
            supplier.setWebsite(req.getWebsite());
        if (req.getNotes() != null)
            supplier.setNotes(req.getNotes());
        if (req.getCreditLimit() != null)
            supplier.setCreditLimit(req.getCreditLimit());
        if (req.getIsActive() != null)
            supplier.setIsActive(req.getIsActive());

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
            String taxCode,
            Boolean active,
            int page,
            int size,
            String sortBy,
            String sortDir) {
        Sort sort = Sort.by(Objects.equals(sortDir, "desc") ? Sort.Direction.DESC : Sort.Direction.ASC,
                (sortBy == null || sortBy.isBlank()) ? "name" : sortBy);
        Pageable pageable = PageRequest.of(Math.max(page, 0), Math.max(size, 1), sort);

        Specification<Supplier> spec = Specification.where(byCompany(companyId))
                .and(likeAny(search))
                .and(likeContact(contact))
                .and(eqTaxCode(taxCode))
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
        String base = s.getName();
        if (s.getContactPerson() != null && !s.getContactPerson().isBlank()) {
            base = base + " (" + s.getContactPerson() + ")";
        }
        if (s.getTaxCode() != null && !s.getTaxCode().isBlank()) {
            base = base + " - " + s.getTaxCode();
        }
        return base;
    }

    private Specification<Supplier> byCompany(Long companyId) {
        return (root, query, cb) -> cb.equal(root.get("company").get("id"), companyId);
    }

    private Specification<Supplier> likeAny(String search) {
        if (search == null || search.isBlank())
            return null;
        String pattern = "%" + search.toLowerCase() + "%";
        return (root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("name")), pattern),
                cb.like(cb.lower(root.get("contactPerson")), pattern),
                cb.like(cb.lower(root.get("phone")), pattern),
                cb.like(cb.lower(root.get("taxCode")), pattern));
    }

    private Specification<Supplier> likeContact(String contact) {
        if (contact == null || contact.isBlank())
            return null;
        String pattern = "%" + contact.toLowerCase() + "%";
        return (root, query, cb) -> cb.like(cb.lower(root.get("contactPerson")), pattern);
    }

    private Specification<Supplier> eqActive(Boolean active) {
        if (active == null)
            return null;
        return (root, query, cb) -> cb.equal(root.get("isActive"), active);
    }

    private Specification<Supplier> eqTaxCode(String taxCode) {
        if (taxCode == null || taxCode.isBlank())
            return null;
        String value = taxCode.toLowerCase();
        return (root, query, cb) -> cb.equal(cb.lower(root.get("taxCode")), value);
    }

    private SupplierDto toDto(Supplier s) {
        return SupplierDto.builder()
                .id(s.getId())
                .name(s.getName())
                .contactPerson(s.getContactPerson())
                .phone(s.getPhone())
                .email(s.getEmail())
                .address(s.getAddress())
                .taxCode(s.getTaxCode())
                .website(s.getWebsite())
                .notes(s.getNotes())
                .outstandingBalance(s.getOutstandingBalance())
                .lastPaymentDate(s.getLastPaymentDate())
                .creditLimit(s.getCreditLimit())
                .isActive(s.getIsActive())
                .createdAt(s.getCreatedAt())
                .updatedAt(s.getUpdatedAt())
                .build();
    }

    // Simple CSV import: columns Code,Name,Phone,Email,Address,Notes (header
    // optional)
    @Transactional
    public int importFromCsv(Long companyId, MultipartFile file) {
        int count = 0;
        try (BufferedReader br = new BufferedReader(
                new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            boolean first = true;
            while ((line = br.readLine()) != null) {
                String trimmed = line.trim();
                if (trimmed.isEmpty())
                    continue;
                // Skip header if present
                if (first && trimmed.toLowerCase().contains("name") && trimmed.toLowerCase().contains("code")) {
                    first = false;
                    continue;
                }
                first = false;
                String[] parts = parseCsvLine(trimmed);
                String code = val(parts, 0);
                String name = val(parts, 1);
                String phone = val(parts, 2);
                String email = val(parts, 3);
                String address = val(parts, 4);
                String notes = val(parts, 5);
                if (name == null || name.isBlank())
                    continue;

                SupplierCreateRequest req = new SupplierCreateRequest();
                req.setName(name);
                req.setPhone(emptyToNull(phone));
                req.setEmail(emptyToNull(email));
                req.setAddress(emptyToNull(address));
                req.setTaxCode(emptyToNull(code));
                req.setNotes(emptyToNull(notes));
                try {
                    create(companyId, req);
                    count++;
                } catch (Exception ignored) {
                    // skip invalid/duplicate rows
                }
            }
        } catch (Exception e) {
            throw new IllegalArgumentException("Failed to import file: " + e.getMessage());
        }
        return count;
    }

    private String[] parseCsvLine(String line) {
        // naive CSV parser supporting commas inside quotes
        List<String> cols = new java.util.ArrayList<>();
        StringBuilder cur = new StringBuilder();
        boolean inQuotes = false;
        for (int i = 0; i < line.length(); i++) {
            char c = line.charAt(i);
            if (c == '"') {
                inQuotes = !inQuotes;
            } else if (c == ',' && !inQuotes) {
                cols.add(cur.toString().trim());
                cur.setLength(0);
            } else {
                cur.append(c);
            }
        }
        cols.add(cur.toString().trim());
        return cols.stream().map(s -> s.replaceAll("^\"|\"$", "")).toArray(String[]::new);
    }

    private String val(String[] arr, int idx) {
        return idx < arr.length ? arr[idx] : null;
    }

    private String emptyToNull(String s) {
        return (s == null || s.isBlank()) ? null : s;
    }
}
