package fa.academy.kiotviet.core.usermanagement.service.registration;

import fa.academy.kiotviet.application.dto.auth.request.RegistrationRequest;
import fa.academy.kiotviet.application.dto.auth.response.AuthResponse;
import fa.academy.kiotviet.core.tenant.domain.Company;
import fa.academy.kiotviet.core.tenant.repository.CompanyRepository;
import fa.academy.kiotviet.core.usermanagement.domain.UserAuth;
import fa.academy.kiotviet.core.usermanagement.domain.UserInfo;
import fa.academy.kiotviet.core.usermanagement.repository.UserAuthRepository;
import fa.academy.kiotviet.core.usermanagement.repository.UserInfoRepository;
import fa.academy.kiotviet.core.usermanagement.service.auth.AuthService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.Base64;

/**
 * Service handling user registration flow including company creation,
 * user account setup, and initial authentication.
 */
@Service
@RequiredArgsConstructor
public class RegistrationService {

    private final CompanyRepository companyRepository;
    private final UserInfoRepository userInfoRepository;
    private final UserAuthRepository userAuthRepository;
      private final PasswordEncoder passwordEncoder;
    private final AuthService authService; // Delegate authentication

    @Transactional
    public AuthResponse register(RegistrationRequest request) {
        // Phase 1: Complete business validation before creating any entities
        validateBusinessRules(request);

        // Phase 2: Create entities only after all validation passes
        Company company = createCompanyFromRequest(request);
        UserInfo user = createUserFromRequest(request, company);
        UserAuth userAuth = createUserAuth(request, user);

        // Phase 3: Save all entities atomically
        company = companyRepository.save(company);
        user.setCompany(company);
        user = userInfoRepository.save(user);
        userAuth.setUser(user);
        userAuthRepository.save(userAuth);

        // Phase 4: Auto-login after registration
        return authService.autoLogin(user);
    }

    private void validateBusinessRules(RegistrationRequest request) {
        // Company-level validation
        if (companyRepository.existsByName(request.getCompanyName())) {
            throw new IllegalArgumentException("Company with this name already exists");
        }

        if (companyRepository.existsByEmail(request.getCompanyEmail())) {
            throw new IllegalArgumentException("Company with this email already exists");
        }

        // Global user validation (prevent basic conflicts before company creation)
        if (userInfoRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already exists in system");
        }

        if (userInfoRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists in system");
        }
    }

    private Company createCompanyFromRequest(RegistrationRequest request) {
        Company company = new Company();
        company.setName(request.getCompanyName());
        company.setEmail(request.getCompanyEmail());
        company.setPhone(request.getCompanyPhone());
        company.setAddress(request.getCompanyAddress());
        company.setTaxCode(request.getTaxCode());
        company.setIsActive(true);
        return company;
    }

    private UserInfo createUserFromRequest(RegistrationRequest request, Company company) {
        UserInfo user = new UserInfo();
        user.setCompany(company);
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setRole(request.getRole());
        user.setIsActive(true);
        return user;
    }

    private UserAuth createUserAuth(RegistrationRequest request, UserInfo user) {
        String salt = generateSalt();
        String passwordHash = passwordEncoder.encode(request.getPassword() + salt);

        UserAuth userAuth = new UserAuth();
        userAuth.setUser(user);
        userAuth.setPasswordHash(passwordHash);
        userAuth.setSalt(salt);
        userAuth.setTwoFactorEnabled(false);
        userAuth.setFailedAttempts(0);
        return userAuth;
    }

    private String generateSalt() {
        SecureRandom random = new SecureRandom();
        byte[] salt = new byte[16];
        random.nextBytes(salt);
        return Base64.getEncoder().encodeToString(salt);
    }
}