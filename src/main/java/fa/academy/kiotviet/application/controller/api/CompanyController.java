package fa.academy.kiotviet.application.controller.api;

import fa.academy.kiotviet.application.dto.company.request.CompanyUpdateRequest;
import fa.academy.kiotviet.application.dto.company.response.CompanyDto;
import fa.academy.kiotviet.application.dto.company.response.CompanyLogoResponse;
import fa.academy.kiotviet.application.dto.shared.SuccessResponse;
import fa.academy.kiotviet.application.service.ResponseFactory;
import fa.academy.kiotviet.core.tenant.service.CompanyService;
import fa.academy.kiotviet.infrastructure.security.SecurityUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/company")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class CompanyController {

    private final CompanyService companyService;

    @GetMapping
    public SuccessResponse<CompanyDto> getCompany() {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        CompanyDto dto = companyService.getCompany(companyId);
        return ResponseFactory.success(dto, "Company information retrieved successfully");
    }

    @PutMapping
    public SuccessResponse<CompanyDto> updateCompany(@Valid @RequestBody CompanyUpdateRequest request) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        CompanyDto dto = companyService.updateCompany(companyId, request);
        return ResponseFactory.success(dto, "Company information updated successfully");
    }

    @PostMapping(value = "/logo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public SuccessResponse<CompanyLogoResponse> uploadLogo(@RequestPart("file") MultipartFile file) {
        Long companyId = SecurityUtil.getCurrentCompanyId();
        CompanyLogoResponse response = companyService.uploadLogo(companyId, file);
        return ResponseFactory.success(response, "Logo uploaded successfully");
    }
}
