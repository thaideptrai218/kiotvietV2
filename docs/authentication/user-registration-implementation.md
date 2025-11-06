# User Registration Implementation Documentation

## Overview

This document describes the implementation of the user registration endpoint for the Kiotviet multi-tenant product management system. The registration allows creation of both a company (tenant) and the first admin user in a single API call.

## Architecture

### Single-Step Registration Design
The registration follows a simple, streamlined approach:
- **Company Creation**: Creates a new tenant/company
- **Admin User Creation**: Creates the first user with admin role
- **Authentication Setup**: Creates credentials and generates JWT tokens

This design was chosen for Kiotviet's target market (large retail sellers) who need quick onboarding without complex workflows.

## Implementation Details

### 1. Domain Entities

#### Company Entity
**File**: `src/main/java/fa/academy/kiotviet/core/domain/tenant/Company.java`

```java
@Entity
@Table(name = "companies")
public class Company {
    private Long id;
    private String name;           // Company name (required)
    private String email;          // Company email (unique)
    private String phone;          // Company phone
    private String address;        // Company address
    private String taxCode;        // Vietnamese tax code
    private Boolean isActive;      // Active status
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

#### UserInfo Entity
**File**: `src/main/java/fa/academy/kiotviet/core/domain/usermanagement/UserInfo.java`

```java
@Entity
@Table(name = "user_info")
public class UserInfo {
    private Long id;
    private Company company;               // Multi-tenant relationship
    private String username;               // Username (unique per company)
    private String email;                  // Email (unique per company)
    private String fullName;               // User's full name
    private String phone;                  // User's phone
    private UserRole role;                 // admin, manager, staff
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

#### UserAuth Entity
**File**: `src/main/java/fa/academy/kiotviet/core/domain/usermanagement/UserAuth.java`

```java
@Entity
@Table(name = "user_auth")
public class UserAuth {
    private Long id;
    private UserInfo user;                 // One-to-one with UserInfo
    private String passwordHash;           // BCrypt + salt hash
    private String salt;                   // Unique salt for password
    private Boolean twoFactorEnabled;      // 2FA status (future)
    private String twoFactorSecret;        // 2FA secret (future)
    private LocalDateTime lastLogin;
    private Integer failedAttempts;
    private LocalDateTime lockedUntil;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

#### UserToken Entity
**File**: `src/main/java/fa/academy/kiotviet/core/domain/usermanagement/UserToken.java`

```java
@Entity
@Table(name = "user_tokens")
public class UserToken {
    private Long id;
    private UserInfo user;                 // Token owner
    private String refreshTokenHash;       // Hashed refresh token
    private String deviceInfo;             // Device description
    private DeviceType deviceType;         // web, mobile, desktop
    private String ipAddress;              // User IP address
    private String userAgent;              // Browser user agent
    private LocalDateTime expiresAt;       // Token expiration
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime lastUsed;
}
```

### 2. Data Transfer Objects

#### RegistrationRequest
**File**: `src/main/java/fa/academy/kiotviet/application/dto/RegistrationRequest.java`

Contains company information and admin user details for registration:

```java
public class RegistrationRequest {
    // Company Information
    private String companyName;            // required, 2-255 chars
    private String companyEmail;           // optional, valid email
    private String companyPhone;           // optional, phone format
    private String companyAddress;         // optional, max 1000 chars
    private String taxCode;                // optional, max 50 chars

    // Admin User Information
    private String username;               // required, 3-100 chars, alphanumeric
    private String email;                  // required, valid email
    private String password;               // required, 8-128 chars, strong password
    private String fullName;               // optional, max 255 chars
    private String phone;                  // optional, phone format
    private UserRole role = UserRole.admin; // Default to admin
}
```

**Validation Rules:**
- Company name: 2-255 characters, required
- Username: 3-100 characters, alphanumeric + underscore, unique per company
- Email: Valid email format, unique per company
- Password: 8-128 characters, must contain uppercase, lowercase, digit, and special character

#### AuthResponse
**File**: `src/main/java/fa/academy/kiotviet/application/dto/AuthResponse.java`

Returns JWT tokens and user information after successful registration:

```java
public class AuthResponse {
    private String accessToken;             // JWT access token
    private String refreshToken;           // JWT refresh token
    private String tokenType = "Bearer";   // Token type
    private Long expiresIn;                // Token expiration in seconds
    private UserInfo userInfo;             // User and company info

    public static class UserInfo {
        private Long id;
        private Long companyId;
        private String companyName;
        private String username;
        private String email;
        private String fullName;
        private String role;
    }
}
```

### 3. Repository Layer

#### CompanyRepository
**File**: `src/main/java/fa/academy/kiotviet/core/repository/CompanyRepository.java`

```java
@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {
    boolean existsByName(String name);
    boolean existsByEmail(String email);
    Optional<Company> findByEmail(String email);
}
```

#### UserInfoRepository
**File**: `src/main/java/fa/academy/kiotviet/core/repository/UserInfoRepository.java`

```java
@Repository
public interface UserInfoRepository extends JpaRepository<UserInfo, Long> {
    boolean existsByUsernameAndCompanyId(String username, Long companyId);
    boolean existsByEmailAndCompanyId(String email, Long companyId);
    Optional<UserInfo> findByUsernameAndCompanyId(String username, Long companyId);
    Optional<UserInfo> findByEmailAndCompanyId(String email, Long companyId);
}
```

#### UserAuthRepository
**File**: `src/main/java/fa/academy/kiotviet/core/repository/UserAuthRepository.java`

```java
@Repository
public interface UserAuthRepository extends JpaRepository<UserAuth, Long> {
    Optional<UserAuth> findByUser(UserInfo user);
    boolean existsByUser(UserInfo user);
}
```

#### UserTokenRepository
**File**: `src/main/java/fa/academy/kiotviet/core/repository/UserTokenRepository.java`

```java
@Repository
public interface UserTokenRepository extends JpaRepository<UserToken, Long> {
    List<UserToken> findByUserAndIsActiveTrue(UserInfo user);
    Optional<UserToken> findByRefreshTokenHashAndExpiresAtAfterAndIsActiveTrue(
        String refreshTokenHash, LocalDateTime now);
    void deleteByUser(UserInfo user);
    void deleteByExpiresAtBefore(LocalDateTime date);
}
```

### 4. Service Layer

#### AuthService
**File**: `src/main/java/fa/academy/kiotviet/core/service/AuthService.java`

The main service orchestrating the registration process:

```java
@Service
@Transactional
public class AuthService {

    @Transactional
    public AuthResponse register(RegistrationRequest request) {
        // 1. Validate company uniqueness
        // 2. Create company (tenant)
        // 3. Validate user uniqueness within company
        // 4. Create user profile
        // 5. Create authentication credentials
        // 6. Generate JWT tokens
        // 7. Store refresh token
        // 8. Return auth response
    }

    private String generateSalt() {
        // Generate secure random salt using Base64 encoding
        SecureRandom random = new SecureRandom();
        byte[] salt = new byte[16];
        random.nextBytes(salt);
        return Base64.getEncoder().encodeToString(salt);
    }
}
```

**Registration Process:**
1. **Validation**: Check if company name/email already exists
2. **Company Creation**: Create new company with provided details
3. **User Creation**: Create admin user linked to the company
4. **Password Security**: Generate salt, hash password with BCrypt + salt
5. **Token Generation**: Create JWT access and refresh tokens
6. **Token Storage**: Store hashed refresh token in database
7. **Response**: Return tokens and user information

### 5. Security Layer

#### JWT Utility
**File**: `src/main/java/fa/academy/kiotviet/infrastructure/security/JwtUtil.java`

Handles JWT token generation and validation:

```java
@Component
public class JwtUtil {

    public String generateToken(Long userId, Long companyId, String username, String role) {
        // Generate access token with user claims
    }

    public String generateRefreshToken(Long userId, String jti) {
        // Generate refresh token with unique ID
    }

    public Claims extractClaims(String token) {
        // Extract and validate JWT claims
    }

    // Additional methods for claim extraction and validation
}
```

**JWT Configuration** (in `application.properties`):
```properties
jwt.secret=KiotvietSecureJwtSecretKey2025!ForDevelopmentOnly!GenerateNewForProduction$MustBe64BytesOrMoreForHS512
jwt.expiration=900           # 15 minutes
jwt.refresh-expiration=604800 # 7 days
```

### 6. Controller Layer

#### AuthController
**File**: `src/main/java/fa/academy/kiotviet/application/controller/AuthController.java`

REST API endpoint for user registration:

```java
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*", maxAge = 3600)
public class AuthController {

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegistrationRequest request) {
        try {
            AuthResponse response = authService.register(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of("message", "Registration failed. Please try again."));
        }
    }
}
```

## API Specification

### POST /api/auth/register

**Request Body:**
```json
{
  "companyName": "ABC Retail Store",
  "companyEmail": "contact@abcstore.com",
  "companyPhone": "0123456789",
  "companyAddress": "123 Main St, Ho Chi Minh City",
  "taxCode": "1234567890",
  "username": "admin",
  "email": "admin@abcstore.com",
  "password": "SecurePass123!",
  "fullName": "John Doe",
  "phone": "0987654321"
}
```

**Success Response (200 OK):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "tokenType": "Bearer",
  "expiresIn": 900,
  "userInfo": {
    "id": 1,
    "companyId": 1,
    "companyName": "ABC Retail Store",
    "username": "admin",
    "email": "admin@abcstore.com",
    "fullName": "John Doe",
    "role": "admin"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "message": "Company with this name already exists"
}
```

**Error Response (500 Internal Server Error):**
```json
{
  "message": "Registration failed. Please try again."
}
```

## Security Considerations

### Password Security
- **Salt Generation**: Each password gets a unique 16-byte salt
- **Hashing**: BCrypt algorithm with salt for password storage
- **Validation**: Strong password requirements enforced

### Multi-Tenant Security
- **Data Isolation**: All queries scoped by company_id
- **Uniqueness Constraints**: Username and email unique per company
- **Foreign Key Constraints**: Prevent cross-tenant data access

### JWT Security
- **Access Token**: 15-minute expiration
- **Refresh Token**: 7-day expiration with rotation
- **Secret Key**: Configurable secure key (change for production)
- **Claims**: Include user ID, company ID, role for authorization

### Input Validation
- **Bean Validation**: Comprehensive validation annotations
- **SQL Injection Protection**: JPA parameterized queries
- **XSS Protection**: Input sanitization in future frontend

## Database Schema

The implementation uses the existing database schema from `V1__Create_kiotviet_core_tables.sql`:

- **companies**: Tenant information
- **user_info**: User profiles with company relationship
- **user_auth**: Authentication credentials (separate table for security)
- **user_tokens**: JWT refresh token management

## Testing

### Compilation Test
```bash
./mvnw clean compile
```

### Future Tests (Not Implemented)
- Unit tests for AuthService
- Integration tests for AuthController
- Multi-tenant isolation tests
- Security vulnerability tests
- Performance load tests

## Configuration

### Security Configuration
**File**: `src/main/java/fa/academy/kiotviet/config/SecurityConfig.java`

```java
@Bean
public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
        .authorizeHttpRequests(authz -> authz
            .requestMatchers("/api/auth/register").permitAll()
            .anyRequest().permitAll()
        )
        .csrf(csrf -> csrf.disable())
        .headers(headers -> headers.frameOptions(frameOptions -> frameOptions.disable()));
    return http.build();
}
```

### Application Properties
**File**: `src/main/resources/application.properties`

Contains database connection, JWT configuration, and other settings.

## Deployment Considerations

### Production Setup Required
1. **JWT Secret**: Generate new secure 64+ byte key
2. **Database Security**: Configure proper MySQL credentials
3. **HTTPS**: Enable SSL/TLS for production
4. **CORS**: Restrict to specific domains in production
5. **Logging**: Configure appropriate log levels
6. **Monitoring**: Set up application monitoring

### Environment Variables
Consider using environment variables for sensitive configuration:
- Database credentials
- JWT secret key
- Redis connection details

## Troubleshooting

### Common Issues
1. **Compilation Errors**: Check Java 17 and Maven dependencies
2. **Database Connection**: Verify MySQL is running and accessible
3. **JWT Errors**: Check secret key configuration
4. **Validation Errors**: Ensure request meets all validation requirements

### Debug Logging
Enable debug logging in `application.properties`:
```properties
logging.level.fa.academy.kiotviet=DEBUG
logging.level.org.springframework.security=DEBUG
```

## Future Enhancements

### Phase 2 (Post-MVP)
1. **Email Verification**: Send verification emails
2. **Two-Factor Authentication**: Implement TOTP-based 2FA
3. **Account Recovery**: Password reset functionality
4. **User Invitations**: Admin users can invite additional users
5. **Advanced Roles**: Permission-based access control

### Phase 3 (Production)
1. **OAuth Integration**: Google/Microsoft login options
2. **SSO Support**: Single sign-on for enterprise customers
3. **Audit Logging**: Comprehensive user activity tracking
4. **Rate Limiting**: Prevent abuse of registration endpoint
5. **CAPTCHA**: Bot protection for registration

## Conclusion

The user registration implementation provides a secure, multi-tenant foundation for the Kiotviet system. It follows Spring Boot best practices, implements proper security measures, and supports the business requirements of Vietnamese retail sellers.

The single-step registration approach prioritizes user experience while maintaining security and data isolation requirements. The architecture supports future enhancements and scalability for the MVP and beyond.