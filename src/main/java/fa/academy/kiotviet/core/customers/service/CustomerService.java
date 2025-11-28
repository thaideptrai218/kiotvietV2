package fa.academy.kiotviet.core.customers.service;

import fa.academy.kiotviet.application.dto.customers.CustomerCreateRequest;
import fa.academy.kiotviet.application.dto.customers.CustomerDto;
import fa.academy.kiotviet.application.dto.customers.CustomerUpdateRequest;
import fa.academy.kiotviet.core.customers.domain.Customer;
import fa.academy.kiotviet.core.customers.repository.CustomerRepository;
import fa.academy.kiotviet.core.shared.exception.ResourceNotFoundException;
import fa.academy.kiotviet.core.tenant.domain.Company;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import fa.academy.kiotviet.application.dto.customers.CustomerAutocompleteItem;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;

    @Transactional
    public CustomerDto create(Long companyId, CustomerCreateRequest req) {
        // Validate unique constraints
        if (req.getCode() != null && !req.getCode().isBlank()) {
            if (customerRepository.existsByCompany_IdAndCode(companyId, req.getCode())) {
                throw new IllegalArgumentException("Customer code already exists");
            }
        }

        if (req.getPhone() != null && !req.getPhone().isBlank()) {
            if (customerRepository.existsByCompany_IdAndPhone(companyId, req.getPhone())) {
                throw new IllegalArgumentException("Phone number already exists");
            }
        }

        Customer customer = Customer.builder()
                .company(Company.builder().id(companyId).build())
                .code(req.getCode())
                .name(req.getName())
                .phone(req.getPhone())
                .email(req.getEmail())
                .address(req.getAddress())
                .ward(req.getWard())
                .district(req.getDistrict())
                .province(req.getProvince())
                .birthDate(req.getBirthDate())
                .gender(req.getGender())
                .taxCode(req.getTaxCode())
                .notes(req.getNotes())
                .status(Customer.CustomerStatus.ACTIVE)
                .build();

        Customer saved = customerRepository.save(customer);
        return toDto(saved);
    }

    @Transactional
    public CustomerDto update(Long companyId, Long id, CustomerUpdateRequest req) {
        Customer customer = customerRepository.findByIdAndCompany_Id(id, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found", "CUSTOMER_NOT_FOUND"));

        if (req.getPhone() != null && !req.getPhone().isBlank() && !req.getPhone().equals(customer.getPhone())) {
            if (customerRepository.existsByCompany_IdAndPhone(companyId, req.getPhone())) {
                throw new IllegalArgumentException("Phone number already exists");
            }
        }

        if (req.getName() != null) customer.setName(req.getName());
        if (req.getPhone() != null) customer.setPhone(req.getPhone());
        if (req.getEmail() != null) customer.setEmail(req.getEmail());
        if (req.getAddress() != null) customer.setAddress(req.getAddress());
        if (req.getWard() != null) customer.setWard(req.getWard());
        if (req.getDistrict() != null) customer.setDistrict(req.getDistrict());
        if (req.getProvince() != null) customer.setProvince(req.getProvince());
        if (req.getBirthDate() != null) customer.setBirthDate(req.getBirthDate());
        if (req.getGender() != null) customer.setGender(req.getGender());
        if (req.getTaxCode() != null) customer.setTaxCode(req.getTaxCode());
        if (req.getNotes() != null) customer.setNotes(req.getNotes());
        if (req.getStatus() != null) customer.setStatus(req.getStatus());

        Customer saved = customerRepository.save(customer);
        return toDto(saved);
    }

    public CustomerDto get(Long companyId, Long id) {
        Customer customer = customerRepository.findByIdAndCompany_Id(id, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found", "CUSTOMER_NOT_FOUND"));
        return toDto(customer);
    }

    @Transactional
    public void delete(Long companyId, Long id) {
        Customer customer = customerRepository.findByIdAndCompany_Id(id, companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found", "CUSTOMER_NOT_FOUND"));
        customer.setStatus(Customer.CustomerStatus.INACTIVE);
        customerRepository.save(customer);
    }

    public Page<CustomerDto> list(Long companyId, String search, Pageable pageable) {
        Specification<Customer> spec = Specification.where(byCompany(companyId))
                .and(likeSearch(search));
        return customerRepository.findAll(spec, pageable).map(this::toDto);
    }

    public List<CustomerAutocompleteItem> autocomplete(Long companyId, String query, int limit) {
        int effectiveLimit = limit <= 0 ? 10 : Math.min(limit, 50);
        Pageable pageable = PageRequest.of(0, effectiveLimit);
        String q = query == null ? "" : query.trim();

        if (q.isEmpty()) {
            return List.of();
        }

        return customerRepository.searchAutocomplete(companyId, q, pageable).stream()
                .map(this::toAutocompleteItem)
                .collect(Collectors.toList());
    }

    // Helper methods
    private CustomerDto toDto(Customer customer) {
        return CustomerDto.builder()
                .id(customer.getId())
                .code(customer.getCode())
                .name(customer.getName())
                .phone(customer.getPhone())
                .email(customer.getEmail())
                .address(customer.getAddress())
                .ward(customer.getWard())
                .district(customer.getDistrict())
                .province(customer.getProvince())
                .birthDate(customer.getBirthDate())
                .gender(customer.getGender())
                .taxCode(customer.getTaxCode())
                .notes(customer.getNotes())
                .status(customer.getStatus())
                .createdAt(customer.getCreatedAt())
                .updatedAt(customer.getUpdatedAt())
                .build();
    }

    private CustomerAutocompleteItem toAutocompleteItem(Customer customer) {
        return CustomerAutocompleteItem.builder()
                .id(customer.getId())
                .name(customer.getName())
                .phone(customer.getPhone())
                .code(customer.getCode())
                .build();
    }

    private Specification<Customer> byCompany(Long companyId) {
        return (root, query, cb) -> cb.equal(root.get("company").get("id"), companyId);
    }

    private Specification<Customer> likeSearch(String search) {
        if (search == null || search.isBlank()) return null;
        String pattern = "%" + search.toLowerCase() + "%";
        return (root, query, cb) -> cb.or(
                cb.like(cb.lower(root.get("name")), pattern),
                cb.like(cb.lower(root.get("phone")), pattern),
                cb.like(cb.lower(root.get("email")), pattern)
        );
    }
}
