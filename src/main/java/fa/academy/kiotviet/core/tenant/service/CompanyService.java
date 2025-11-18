package fa.academy.kiotviet.core.tenant.service;

import fa.academy.kiotviet.application.dto.company.request.CompanyUpdateRequest;
import fa.academy.kiotviet.application.dto.company.response.CompanyDto;
import fa.academy.kiotviet.application.dto.company.response.CompanyLogoResponse;
import org.springframework.web.multipart.MultipartFile;

public interface CompanyService {
    CompanyDto getCompany(Long companyId);
    CompanyDto updateCompany(Long companyId, CompanyUpdateRequest request);
    CompanyLogoResponse uploadLogo(Long companyId, MultipartFile file);
}
