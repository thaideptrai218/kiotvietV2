package fa.academy.kiotviet.core.tenant.service;

import fa.academy.kiotviet.application.dto.company.request.CompanyUpdateRequest;
import fa.academy.kiotviet.application.dto.company.response.CompanyDto;
import fa.academy.kiotviet.application.dto.company.response.CompanyLogoResponse;
import fa.academy.kiotviet.core.shared.exception.ResourceNotFoundException;
import fa.academy.kiotviet.core.tenant.domain.Company;
import fa.academy.kiotviet.core.tenant.repository.CompanyRepository;
import fa.academy.kiotviet.infrastructure.storage.FileStorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.text.Normalizer;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CompanyServiceImpl implements CompanyService {

    private final CompanyRepository companyRepository;
    private final FileStorageService fileStorageService;

    @Value("${app.company.domain-template:https://%s.kiotviet.vn}")
    private String domainTemplate;

    @Override
    @Transactional(readOnly = true)
    public CompanyDto getCompany(Long companyId) {
        Company company = requireCompany(companyId);
        return toDto(company);
    }

    @Override
    @Transactional
    public CompanyDto updateCompany(Long companyId, CompanyUpdateRequest request) {
        Company company = requireCompany(companyId);

        if (request.getPhone() != null) {
            company.setPhone(request.getPhone());
        }
        if (request.getCountry() != null) {
            company.setCountry(request.getCountry());
        }
        if (request.getCountryFlag() != null) {
            company.setCountryFlag(request.getCountryFlag());
        }
        if (request.getName() != null) {
            if (request.getName().isBlank()) {
                throw new IllegalArgumentException("Store name cannot be blank");
            }
            company.setName(request.getName());
        }
        if (request.getAddress() != null) {
            company.setAddress(request.getAddress());
        }
        if (request.getProvince() != null) {
            company.setProvince(request.getProvince());
        }
        if (request.getWard() != null) {
            company.setWard(request.getWard());
        }

        company.setUpdatedAt(LocalDateTime.now());
        Company saved = companyRepository.save(company);
        return toDto(saved);
    }

    @Override
    @Transactional
    public CompanyLogoResponse uploadLogo(Long companyId, MultipartFile file) {
        Company company = requireCompany(companyId);
        String logoUrl = fileStorageService.storeCompanyLogo(companyId, file);
        company.setLogoUrl(logoUrl);
        company.setUpdatedAt(LocalDateTime.now());
        companyRepository.save(company);
        return new CompanyLogoResponse(logoUrl);
    }

    private Company requireCompany(Long companyId) {
        return companyRepository.findByIdAndIsActiveTrue(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found", "COMPANY_NOT_FOUND"));
    }

    private CompanyDto toDto(Company company) {
        return CompanyDto.builder()
                .id(company.getId())
                .url(buildStoreUrl(company))
                .name(company.getName())
                .email(company.getEmail())
                .phone(company.getPhone())
                .country(company.getCountry())
                .countryFlag(company.getCountryFlag())
                .address(company.getAddress())
                .province(company.getProvince())
                .ward(company.getWard())
                .taxCode(company.getTaxCode())
                .logoUrl(company.getLogoUrl())
                .build();
    }

    private String buildStoreUrl(Company company) {
        String template = (domainTemplate == null || domainTemplate.isBlank())
                ? "https://%s.kiotviet.vn"
                : domainTemplate.trim();
        String slug = slugify(company.getName(), company.getId());
        if (template.contains("%d")) {
            return String.format(template, company.getId());
        }
        if (template.contains("%s")) {
            return String.format(template, slug);
        }
        if (template.endsWith("/")) {
            return template + slug;
        }
        return template;
    }

    private String slugify(String value, Long companyId) {
        if (value == null || value.isBlank()) {
            return "company-" + companyId;
        }
        String normalized = Normalizer.normalize(value, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        String slug = normalized.replaceAll("[^a-zA-Z0-9]+", "-")
                .replaceAll("(^-|-$)", "")
                .toLowerCase();
        if (slug.isBlank()) {
            slug = "company-" + companyId;
        }
        return slug;
    }
}
