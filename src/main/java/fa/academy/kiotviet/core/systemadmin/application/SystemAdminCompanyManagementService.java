package fa.academy.kiotviet.core.systemadmin.application;

import fa.academy.kiotviet.core.systemadmin.dto.SystemAdminCompanyCreateDTO;
import fa.academy.kiotviet.core.systemadmin.dto.SystemAdminCompanyDetailsDTO;
import fa.academy.kiotviet.core.systemadmin.dto.SystemAdminCompanyListDTO;
import fa.academy.kiotviet.core.systemadmin.dto.SystemAdminCompanyUpdateDTO;
import fa.academy.kiotviet.core.systemadmin.exception.CompanyNotFoundException;
import fa.academy.kiotviet.core.tenant.domain.Company;
import fa.academy.kiotviet.core.tenant.repository.CompanyRepository;
import fa.academy.kiotviet.core.usermanagement.repository.UserInfoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for managing companies across all tenants (System Admin)
 * Provides CRUD operations without tenant filtering
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class SystemAdminCompanyManagementService {

    private final CompanyRepository companyRepository;
    private final UserInfoRepository userInfoRepository;

    /**
     * Get all companies with pagination (cross-tenant query)
     * Supports optional filtering by status and keyword search
     */
    public Page<SystemAdminCompanyListDTO> getAllCompanies(Pageable pageable, String status, String keyword) {
        log.info("System Admin: Fetching all companies with pagination - status: {}, keyword: {}", status, keyword);

        List<Company> allCompanies = companyRepository.findAll();

        // Apply filters
        List<Company> filteredCompanies = allCompanies.stream()
                // Filter by status
                .filter(company -> {
                    if (status == null || status.isEmpty()) return true;
                    boolean isActive = company.getIsActive() != null ? company.getIsActive() : true;
                    if ("active".equalsIgnoreCase(status)) return isActive;
                    if ("suspended".equalsIgnoreCase(status) || "inactive".equalsIgnoreCase(status)) return !isActive;
                    return true;
                })
                // Filter by keyword (search in name and email)
                .filter(company -> {
                    if (keyword == null || keyword.isEmpty()) return true;
                    String lowerKeyword = keyword.toLowerCase();
                    return (company.getName() != null && company.getName().toLowerCase().contains(lowerKeyword))
                            || (company.getEmail() != null && company.getEmail().toLowerCase().contains(lowerKeyword));
                })
                .collect(Collectors.toList());

        // Apply pagination manually
        int start = (int) pageable.getOffset();
        int end = Math.min(start + pageable.getPageSize(), filteredCompanies.size());
        List<Company> pagedCompanies = filteredCompanies.subList(start, end);

        return new org.springframework.data.domain.PageImpl<>(
                pagedCompanies.stream().map(company -> {
                    Long userCount = userInfoRepository.countByCompanyId(company.getId());

                    return SystemAdminCompanyListDTO.builder()
                            .id(company.getId())
                            .name(company.getName())
                            .email(company.getEmail())
                            .phone(company.getPhone())
                            .address(company.getAddress())
                            .isActive(company.getIsActive())
                            .isSuspended(false) // Will be implemented with Phase 01 DB migration
                            .userCount(userCount)
                            .createdAt(company.getCreatedAt())
                            .updatedAt(company.getUpdatedAt())
                            .build();
                }).collect(Collectors.toList()),
                pageable,
                filteredCompanies.size()
        );
    }

    /**
     * Get detailed information about a specific company
     */
    @Transactional(readOnly = true)
    public SystemAdminCompanyDetailsDTO getCompanyDetails(Long companyId) {
        log.info("System Admin: Fetching details for company ID: {}", companyId);

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new CompanyNotFoundException(companyId));

        Long userCount = userInfoRepository.countByCompanyId(companyId);
        Long activeUserCount = userInfoRepository.countByCompanyIdAndIsActiveTrue(companyId);

        return SystemAdminCompanyDetailsDTO.builder()
                .id(company.getId())
                .name(company.getName())
                .email(company.getEmail())
                .phone(company.getPhone())
                .address(company.getAddress())
                .country(company.getCountry())
                .province(company.getProvince())
                .ward(company.getWard())
                .taxCode(company.getTaxCode())
                .logoUrl(company.getLogoUrl())
                .isActive(company.getIsActive())
                .isSuspended(false) // Will be implemented with Phase 01 DB migration
                .userCount(userCount)
                .activeUserCount(activeUserCount)
                .productCount(0L) // TODO: Implement when Product repository is available
                .orderCount(0L) // TODO: Implement when Order repository is available
                .createdAt(company.getCreatedAt())
                .updatedAt(company.getUpdatedAt())
                .build();
    }

    /**
     * Create a new company (system admin only)
     */
    @Transactional
    public SystemAdminCompanyDetailsDTO createCompany(SystemAdminCompanyCreateDTO dto) {
        log.info("System Admin: Creating new company with name: {}", dto.getName());

        // Check if email already exists
        if (companyRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Company with email " + dto.getEmail() + " already exists");
        }

        // Check if company name already exists
        if (companyRepository.existsByName(dto.getName())) {
            throw new IllegalArgumentException("Company with name " + dto.getName() + " already exists");
        }

        Company company = Company.builder()
                .name(dto.getName())
                .email(dto.getEmail())
                .phone(dto.getPhone())
                .address(dto.getAddress())
                .country(dto.getCountry())
                .province(dto.getProvince())
                .ward(dto.getWard())
                .taxCode(dto.getTaxCode())
                .isActive(true)
                .build();

        Company savedCompany = companyRepository.save(company);

        log.info("System Admin: Company created successfully with ID: {}", savedCompany.getId());

        return getCompanyDetails(savedCompany.getId());
    }

    /**
     * Update company information (system admin only)
     */
    @Transactional
    public SystemAdminCompanyDetailsDTO updateCompany(Long companyId, SystemAdminCompanyUpdateDTO dto) {
        log.info("System Admin: Updating company ID: {}", companyId);

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new CompanyNotFoundException(companyId));

        // Check email uniqueness if email is being changed
        if (dto.getEmail() != null && !dto.getEmail().equals(company.getEmail())) {
            if (companyRepository.existsByEmail(dto.getEmail())) {
                throw new IllegalArgumentException("Company with email " + dto.getEmail() + " already exists");
            }
            company.setEmail(dto.getEmail());
        }

        // Check name uniqueness if name is being changed
        if (dto.getName() != null && !dto.getName().equals(company.getName())) {
            if (companyRepository.existsByName(dto.getName())) {
                throw new IllegalArgumentException("Company with name " + dto.getName() + " already exists");
            }
            company.setName(dto.getName());
        }

        if (dto.getPhone() != null) {
            company.setPhone(dto.getPhone());
        }
        if (dto.getAddress() != null) {
            company.setAddress(dto.getAddress());
        }
        if (dto.getCountry() != null) {
            company.setCountry(dto.getCountry());
        }
        if (dto.getProvince() != null) {
            company.setProvince(dto.getProvince());
        }
        if (dto.getWard() != null) {
            company.setWard(dto.getWard());
        }
        if (dto.getTaxCode() != null) {
            company.setTaxCode(dto.getTaxCode());
        }

        Company savedCompany = companyRepository.save(company);

        log.info("System Admin: Company ID {} updated successfully", companyId);

        return getCompanyDetails(savedCompany.getId());
    }

    /**
     * Suspend a company (prevent all users from logging in)
     */
    @Transactional
    public void suspendCompany(Long companyId) {
        log.info("System Admin: Suspending company ID: {}", companyId);

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new CompanyNotFoundException(companyId));

        company.setIsActive(false);
        companyRepository.save(company);

        log.info("System Admin: Company ID {} suspended successfully", companyId);
    }

    /**
     * Activate a company (allow users to log in again)
     */
    @Transactional
    public void activateCompany(Long companyId) {
        log.info("System Admin: Activating company ID: {}", companyId);

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new CompanyNotFoundException(companyId));

        company.setIsActive(true);
        companyRepository.save(company);

        log.info("System Admin: Company ID {} activated successfully", companyId);
    }

    /**
     * Delete a company (cascade delete all related data)
     */
    @Transactional
    public void deleteCompany(Long companyId) {
        log.info("System Admin: Deleting company ID: {}", companyId);

        if (!companyRepository.existsById(companyId)) {
            throw new CompanyNotFoundException(companyId);
        }

        companyRepository.deleteById(companyId);

        log.info("System Admin: Company ID {} deleted successfully", companyId);
    }

    /**
     * Search companies by name or email (cross-tenant query)
     */
    @Transactional(readOnly = true)
    public List<SystemAdminCompanyListDTO> searchCompanies(String keyword) {
        log.info("System Admin: Searching companies with keyword: {}", keyword);

        List<Company> companies = companyRepository.findAll();

        return companies.stream()
                .filter(company -> company.getName().toLowerCase().contains(keyword.toLowerCase())
                        || (company.getEmail() != null && company.getEmail().toLowerCase().contains(keyword.toLowerCase())))
                .map(company -> {
                    Long userCount = userInfoRepository.countByCompanyId(company.getId());

                    return SystemAdminCompanyListDTO.builder()
                            .id(company.getId())
                            .name(company.getName())
                            .email(company.getEmail())
                            .phone(company.getPhone())
                            .address(company.getAddress())
                            .isActive(company.getIsActive())
                            .isSuspended(false)
                            .userCount(userCount)
                            .createdAt(company.getCreatedAt())
                            .updatedAt(company.getUpdatedAt())
                            .build();
                })
                .collect(Collectors.toList());
    }
}
