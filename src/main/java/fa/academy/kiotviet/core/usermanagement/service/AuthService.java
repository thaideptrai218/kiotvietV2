package fa.academy.kiotviet.core.usermanagement.service;

import fa.academy.kiotviet.application.dto.auth.request.RegistrationRequest;
import fa.academy.kiotviet.application.dto.auth.response.AuthResponse;
import fa.academy.kiotviet.core.tenant.domain.Company;
import fa.academy.kiotviet.core.tenant.repository.CompanyRepository;
import fa.academy.kiotviet.core.usermanagement.domain.UserAuth;
import fa.academy.kiotviet.core.usermanagement.domain.UserInfo;
import fa.academy.kiotviet.core.usermanagement.domain.UserToken;
import fa.academy.kiotviet.core.usermanagement.repository.UserAuthRepository;
import fa.academy.kiotviet.core.usermanagement.repository.UserInfoRepository;
import fa.academy.kiotviet.core.usermanagement.repository.UserTokenRepository;
import fa.academy.kiotviet.infrastructure.security.JwtUtil;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final CompanyRepository companyRepository;
    private final UserInfoRepository userInfoRepository;
    private final UserAuthRepository userAuthRepository;
    private final UserTokenRepository userTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    @Transactional
    public AuthResponse register(RegistrationRequest request) {
        if (companyRepository.existsByName(request.getCompanyName())) {
            throw new IllegalArgumentException("Company with this name already exists");
        }

        if (companyRepository.existsByEmail(request.getCompanyEmail())) {
            throw new IllegalArgumentException("Company with this email already exists");
        }

        Company company = new Company();
        company.setName(request.getCompanyName());
        company.setEmail(request.getCompanyEmail());
        company.setPhone(request.getCompanyPhone());
        company.setAddress(request.getCompanyAddress());
        company.setTaxCode(request.getTaxCode());
        company.setIsActive(true);
        company = companyRepository.save(company);

        if (userInfoRepository.existsByUsernameAndCompanyId(request.getUsername(), company.getId())) {
            throw new IllegalArgumentException("Username already exists in this company");
        }

        if (userInfoRepository.existsByEmailAndCompanyId(request.getEmail(), company.getId())) {
            throw new IllegalArgumentException("Email already exists in this company");
        }

        UserInfo user = new UserInfo();
        user.setCompany(company);
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setRole(request.getRole());
        user.setIsActive(true);
        user = userInfoRepository.save(user);

        String salt = generateSalt();
        String passwordHash = passwordEncoder.encode(request.getPassword() + salt);

        UserAuth userAuth = new UserAuth();
        userAuth.setUser(user);
        userAuth.setPasswordHash(passwordHash);
        userAuth.setSalt(salt);
        userAuth.setTwoFactorEnabled(false);
        userAuth.setFailedAttempts(0);
        userAuthRepository.save(userAuth);

        String jti = UUID.randomUUID().toString();
        String accessToken = jwtUtil.generateToken(user.getId(), company.getId(), user.getUsername(), user.getRole().toString());
        String refreshToken = jwtUtil.generateRefreshToken(user.getId(), jti);
        String refreshTokenHash = passwordEncoder.encode(refreshToken);

        UserToken token = new UserToken();
        token.setUser(user);
        token.setRefreshTokenHash(refreshTokenHash);
        token.setExpiresAt(LocalDateTime.now().plusSeconds(jwtUtil.getAccessTokenExpiration() * 7));
        token.setDeviceInfo("Registration");
        token.setDeviceType(UserToken.DeviceType.WEB);
        token.setIsActive(true);
        userTokenRepository.save(token);

        AuthResponse.UserInfo userInfo = new AuthResponse.UserInfo(
            user.getId(),
            company.getId(),
            company.getName(),
            user.getUsername(),
            user.getEmail(),
            user.getFullName(),
            user.getRole().toString()
        );

        return new AuthResponse(accessToken, refreshToken, "Bearer", jwtUtil.getAccessTokenExpiration(), userInfo);
    }

    private String generateSalt() {
        SecureRandom random = new SecureRandom();
        byte[] salt = new byte[16];
        random.nextBytes(salt);
        return Base64.getEncoder().encodeToString(salt);
    }
}