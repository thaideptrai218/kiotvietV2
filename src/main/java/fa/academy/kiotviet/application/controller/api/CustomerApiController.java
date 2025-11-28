package fa.academy.kiotviet.application.controller.api;

import fa.academy.kiotviet.application.dto.customers.CustomerCreateRequest;
import fa.academy.kiotviet.application.dto.customers.CustomerDto;
import fa.academy.kiotviet.application.dto.customers.CustomerUpdateRequest;
import fa.academy.kiotviet.application.dto.shared.SuccessResponse;
import fa.academy.kiotviet.application.service.ResponseFactory;
import fa.academy.kiotviet.core.customers.service.CustomerService;
import fa.academy.kiotviet.infrastructure.security.JwtAuthenticationFilter;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class CustomerApiController {

    private final CustomerService customerService;

    @GetMapping
    public SuccessResponse<Page<CustomerDto>> listCustomers(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir) {

        Long companyId = currentCompanyId();
        Sort sort = Sort.by("desc".equalsIgnoreCase(sortDir) ? Sort.Direction.DESC : Sort.Direction.ASC,
                (sortBy == null || sortBy.isBlank()) ? "name" : sortBy);
        PageRequest pageable = PageRequest.of(Math.max(page, 0), Math.max(size, 1), sort);

        Page<CustomerDto> customers = customerService.list(companyId, search, pageable);
        return ResponseFactory.success(customers, "Customers retrieved successfully");
    }

    @GetMapping("/{id}")
    public SuccessResponse<CustomerDto> getCustomer(@PathVariable Long id) {
        Long companyId = currentCompanyId();
        CustomerDto customer = customerService.get(companyId, id);
        return ResponseFactory.success(customer, "Customer retrieved successfully");
    }

    @PostMapping
    public SuccessResponse<CustomerDto> createCustomer(@Valid @RequestBody CustomerCreateRequest request) {
        Long companyId = currentCompanyId();
        CustomerDto customer = customerService.create(companyId, request);
        return ResponseFactory.created(customer, "Customer created successfully");
    }

    @PutMapping("/{id}")
    public SuccessResponse<CustomerDto> updateCustomer(
            @PathVariable Long id,
            @Valid @RequestBody CustomerUpdateRequest request) {
        Long companyId = currentCompanyId();
        CustomerDto customer = customerService.update(companyId, id, request);
        return ResponseFactory.success(customer, "Customer updated successfully");
    }

    @DeleteMapping("/{id}")
    public SuccessResponse<String> deleteCustomer(@PathVariable Long id) {
        Long companyId = currentCompanyId();
        customerService.delete(companyId, id);
        return ResponseFactory.success("Customer deleted successfully");
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
