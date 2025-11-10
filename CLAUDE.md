# Code Review Response Guidelines

## Core Principle
Actions speak louder than words. Let the code show you heard the feedback.

## When Feedback is Correct

### ✅ DO:
- "Fixed. [Brief description of what changed]"
- "Good catch - [specific issue]. Fixed in [location]."
- Just fix it and show the change in the code

### ❌ DON'T:
- Use gratitude expressions ("Thanks!", "Great point!", "You're right!")
- Write generic acknowledgments
- Over-explain or be overly apologetic

### Key Rule:
**If you're about to write "Thanks" → DELETE IT. State the fix instead.**

## When You Pushed Back and Were Wrong

### ✅ DO:
- "You were right - I checked [X] and it does [Y]. Implementing now."
- "Verified this and you're correct. My initial understanding was wrong because [reason]. Fixing."

### ❌ DON'T:
- Write long apologies
- Defend why you pushed back
- Over-explain the situation

### Key Rule:
**State the correction factually and move on.**

## Why This Matters
The code itself demonstrates you received and acted on feedback. Professional communication is concise, action-oriented, and ego-free.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Kiotviet-style multi-tenant product management system for large retail sellers in Vietnam. Built with Spring Boot 3.5.7 and Java 17, designed to handle 1000+ products per account with high-concurrency requirements. The system features hierarchical categories, supplier management, real-time inventory tracking, and scalable search capabilities.

### Project Status

-   **Current Phase**: MVP Implementation (Week 1 of 6)
-   **Progress**: Database schema simplified and documented for MVP
-   **Timeline**: November 5 - December 17, 2025
-   **Target**: Production-ready MVP for pilot testing
-   **Latest Update**: JWT-based authentication system with shared JavaScript implemented (2025-11-10)

### Business Model & Scale

-   **Target**: Large retail sellers with multiple store locations
-   **Multi-tenant**: Account-based isolation with high-security requirements
-   **Scale**: 1000+ products per account, 100+ concurrent users per tenant
-   **Performance**: <500ms product search (MVP target), <2s page load
-   **Architecture**: MySQL + Redis stack for MVP, Elasticsearch post-MVP

### Core Requirements (MVP Simplified)

-   Multi-tenant user management with 2FA support (4-table design: accounts, user_info, user_auth, user_tokens)
-   Product catalog with barcode search and multiple image support
-   Hierarchical categories with path-based storage (`/electronics/mobile/phones`)
-   Supplier management (basic contact information only for MVP)
-   Real-time inventory tracking with manual stock adjustments
-   High-performance search using MySQL FULLTEXT (MVP), Elasticsearch post-MVP

### Progress Tracking

-   **Implementation Plan**: `/home/welterial/kiotviet/plan-progress.md`
-   **Technical Specification**: `/home/welterial/kiotviet/docs/kiotviet-tech-spec.md` (UPDATED)
-   **Architectural Strategy**: `/home/welterial/kiotviet/KIOTVIET_MVP_ARCHITECTURAL_STRATEGY.md`
-   **Database Migrations**: `/home/welterial/kiotviet/src/main/resources/db/migration/` (SIMPLIFIED)

### Critical Architecture Decisions (MVP Focus)

#### Database & Storage (MVP Simplified)

-   **Primary**: MySQL with account_id multi-tenant isolation
-   **Caching**: Redis for product catalog, categories, search results
-   **Search**: MySQL FULLTEXT for MVP (<1000 products), Elasticsearch migration post-MVP
-   **Images**: Local filesystem storage (`/uploads/products/{accountId}/{productId}/`)
-   **MVP Tables**: accounts, user_info, user_auth, user_tokens, categories, suppliers, products, product_images, inventory, inventory_transactions
-   **Commented Out**: audit_logs, stock_adjustments, low_stock_alerts (add post-MVP)

#### Performance & Concurrency (MVP Targets)

-   **Locking Strategy**: Pessimistic locking (SELECT FOR UPDATE) for inventory + optimistic locking (JPA @Version)
-   **Caching Strategy**: Cache-aside pattern with automatic invalidation on updates
-   **Indexing**: Essential MVP indexes on (account_id, business_key) combinations
-   **Response Targets**: <500ms product search, <200ms API average, <2s page load

#### Security & Multi-Tenancy (MVP Implementation)

-   **Tenant Isolation**: JPA-level automatic account_id filtering
-   **Security Layer**: JWT authentication with refresh tokens (15min access, 7day refresh)
-   **Two-Factor Auth**: Enabled for MVP (user preference)
-   **Permissions**: Simple role-based (admin/manager/staff) for MVP, JSON permissions post-MVP
-   **Data Consistency**: Manual cache invalidation, event-driven post-MVP

## Development Commands

### Build and Run

-   **Build project**: `./mvnw clean compile`
-   **Run application**: `./mvnw spring-boot:run`
-   **Package JAR**: `./mvnw clean package`
-   **Run tests**: `./mvnw test`
-   **Run specific test**: `./mvnw test -Dtest=ClassName`

### Development Patterns

#### Finding @Autowired Usage (for migration)
```bash
# Find all files using @Autowired for migration to @RequiredArgsConstructor
find /home/welterial/haizz/kiotviet/src/main/java -name "*.java" -exec grep -l "@Autowired" {} \;
```

#### Testing API Endpoints
```bash
# Test authentication endpoint
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"companyName":"Test Company","email":"test@example.com","username":"testuser","password":"TestPass123!"}'

# Test with authentication
curl -X GET http://localhost:8080/api/users/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Database Operations
```bash
# Run database migrations
./mvnw flyway:migrate

# Check migration status
./mvnw flyway:info

# Repair database after failed migration
./mvnw flyway:repair
```

### Maven Wrapper

-   Use `./mvnw` (Linux/Mac) or `mvnw.cmd` (Windows) instead of `mvn` to ensure consistent Maven version

### Code Quality Checks

#### Find Lombok Usage
```bash
# Verify @RequiredArgsConstructor usage
grep -r "@RequiredArgsConstructor" /home/welterial/haizz/kiotviet/src/main/java/

# Check for remaining @Autowired usage
grep -r "@Autowired" /home/welterial/haizz/kiotviet/src/main/java/
```

#### Verify Package Structure
```bash
# Check DTO organization
find /home/welterial/haizz/kiotviet/src/main/java/fa/academy/kiotviet/application/dto -type d

# Check controller organization
find /home/welterial/haizz/kiotviet/src/main/java/fa/academy/kiotviet/application/controller -type d

# Check core domain organization
find /home/welterial/haizz/kiotviet/src/main/java/fa/academy/kiotviet/core -type d
```

## Architecture

### Technology Stack (MVP)

-   **Framework**: Spring Boot 3.5.7 with Java 17
-   **Database**: MySQL 8.0 with Spring Data JPA + Flyway migrations
-   **Cache**: Redis 7.0 for session management and caching
-   **Security**: Spring Security + JWT authentication
-   **Frontend**: HTML5 + JavaScript (AJAX) + Bootstrap 5.3
-   **Image Storage**: Local filesystem (`/uploads/`) for MVP
-   **Search**: MySQL FULLTEXT (MVP), Elasticsearch post-MVP
-   **Build Tool**: Maven 3.9
-   **Code Quality**: Lombok for boilerplate reduction

### Project Structure (Domain-First Enterprise Architecture)

```
kiotviet/
├── docs/                               # Documentation
│   ├── kiotviet-tech-spec.md           # Complete technical specification
│   ├── architecture/                   # Architecture decisions and patterns
│   ├── deployment/                     # Deployment guides and configurations
│   ├── development/                    # Development guidelines and workflows
│   └── user-guide/                     # User documentation
├── src/
│   ├── main/
│   │   ├── java/fa/academy/kiotviet/   # Main application code (professional architecture)
│   │   │   ├── config/                  # Configuration classes
│   │   │   │   ├── SecurityConfig.java  # Spring Security configuration
│   │   │   │   ├── JpaConfig.java      # JPA and auditing config
│   │   │   │   ├── RedisConfig.java    # Redis caching configuration
│   │   │   │   ├── WebConfig.java      # Web MVC and CORS configuration
│   │   │   │   └── GlobalExceptionHandler.java # Global error handling
│   │   │   ├── application/             # Application layer
│   │   │   │   ├── controller/          # Web controllers
│   │   │   │   │   ├── api/            # REST API controllers
│   │   │   │   │   │   ├── AuthApiController.java     # Authentication APIs
│   │   │   │   │   │   ├── UserController.java        # User management APIs
│   │   │   │   │   │   ├── ProductController.java     # Product catalog APIs
│   │   │   │   │   │   └── InventoryController.java   # Inventory APIs
│   │   │   │   │   ├── web/            # Page rendering controllers
│   │   │   │   │   │   ├── AuthPageController.java    # Authentication pages
│   │   │   │   │   │   ├── DashboardController.java   # Dashboard pages
│   │   │   │   │   │   └── ProductPageController.java # Product pages
│   │   │   │   │   └── shared/         # Shared controller utilities
│   │   │   │   │       ├── BaseController.java        # Common controller functionality
│   │   │   │   │       └── ControllerAdvice.java     # Global controller advice
│   │   │   │   ├── dto/                 # Data transfer objects
│   │   │   │   │   ├── shared/         # Shared across domains
│   │   │   │   │   │   ├── SuccessResponse.java       # API success wrapper
│   │   │   │   │   │   ├── ErrorResponse.java         # API error wrapper
│   │   │   │   │   │   ├── PagedResponse.java         # Pagination wrapper
│   │   │   │   │   │   ├── BaseRequest.java           # Base API request class
│   │   │   │   │   │   ├── BaseResponse.java          # Base API response class
│   │   │   │   │   │   └── common/                    # Common data structures
│   │   │   │   │   │       ├── UserInfoDto.java      # User information
│   │   │   │   │   │       ├── AddressDto.java       # Address information
│   │   │   │   │   │       └── ContactInfoDto.java   # Contact information
│   │   │   │   │   ├── auth/           # Authentication domain DTOs
│   │   │   │   │   │   ├── request/RegistrationRequest.java
│   │   │   │   │   │   └── response/AuthResponse.java
│   │   │   │   │   ├── form/           # HTML form objects
│   │   │   │   │   │   ├── LoginForm.java             # Login form
│   │   │   │   │   │   ├── RegistrationForm.java      # Registration form
│   │   │   │   │   │   └── ProductSearchForm.java     # Product search form
│   │   │   │   │   ├── user/           # User management DTOs
│   │   │   │   │   ├── product/        # Product catalog DTOs
│   │   │   │   │   ├── inventory/      # Inventory DTOs
│   │   │   │   │   └── orders/         # Order DTOs
│   │   │   │   └── service/            # Application services
│   │   │   │       └── ResponseFactory.java           # Centralized response creation
│   │   │   ├── core/                    # Domain layer (domain-first organization)
│   │   │   │   ├── tenant/             # Multi-tenant domain
│   │   │   │   │   ├── domain/Company.java            # Company entity
│   │   │   │   │   ├── repository/CompanyRepository.java
│   │   │   │   │   ├── service/TenantService.java
│   │   │   │   │   └── exception/TenantException.java
│   │   │   │   ├── usermanagement/    # User management domain
│   │   │   │   │   ├── domain/UserInfo.java, UserAuth.java, UserToken.java
│   │   │   │   │   ├── repository/UserInfoRepository.java, UserAuthRepository.java
│   │   │   │   │   ├── service/AuthService.java, UserService.java
│   │   │   │   │   └── exception/UserManagementException.java
│   │   │   │   ├── productcatalog/    # Product catalog domain
│   │   │   │   ├── inventory/         # Inventory management domain
│   │   │   │   ├── orders/            # Order processing domain
│   │   │   │   ├── suppliers/         # Supplier management domain
│   │   │   │   ├── analytics/         # Business analytics domain
│   │   │   │   └── shared/            # Shared domain components
│   │   │   │       ├── domain/BaseEntity.java     # Common entity functionality
│   │   │   │       ├── exception/                # Exception hierarchy
│   │   │   │       │   ├── KiotvietException.java     # Base exception
│   │   │   │       │   ├── BusinessRuleException.java  # Business logic
│   │   │   │       │   └── ResourceNotFoundException.java
│   │   │   │       └── util/CommonUtilities.java     # Shared utilities
│   │   │   ├── infrastructure/         # Infrastructure layer
│   │   │   │   ├── security/          # Security implementation
│   │   │   │   │   ├── JwtAuthenticationFilter.java   # JWT authentication filter
│   │   │   │   │   ├── JwtUtil.java                   # JWT token utilities
│   │   │   │   │   └── service/                       # Security services
│   │   │   │   ├── persistence/       # JPA implementations
│   │   │   │   └── external/          # Third-party integrations
│   │   │   └── KiotvietApplication.java # Main Spring Boot application
│   │   └── resources/
│   │       ├── db/migration/            # Flyway database migrations (MVP simplified)
│   │       ├── static/                  # Professional frontend asset structure
│   │       │   ├── core/               # Base assets shared across tenants
│   │       │   │   ├── css/
│   │       │   │   │   ├── bootstrap/  # Bootstrap framework
│   │       │   │   │   ├── themes/     # Theme system
│   │       │   │   │   └── components/ # Reusable components
│   │       │   │   ├── js/
│   │       │   │   │   ├── vendor/     # Third-party libraries
│   │       │   │   │   ├── core/       # Core application JavaScript
│   │       │   │   │   └── components/ # Reusable JS components
│   │       │   │   └── images/         # System icons, defaults
│   │       │   ├── tenants/            # Tenant-specific customizations
│   │       │   │   ├── css/            # Custom themes & overrides
│   │       │   │   ├── js/             # Tenant-specific logic
│   │       │   │   ├── images/         # Logos, branding
│   │       │   │   └── config/         # Tenant configuration
│   │       │   ├── modules/            # Feature-based modules
│   │       │   │   ├── auth/           # Authentication assets
│   │       │   │   ├── dashboard/      # Dashboard assets
│   │       │   │   ├── products/       # Product management assets
│   │       │   │   ├── inventory/      # Inventory assets
│   │       │   │   ├── suppliers/      # Supplier assets
│   │       │   │   ├── reports/        # Reporting assets
│   │       │   │   └── common/         # Shared layout components
│   │       │   ├── versions/           # Versioned assets for cache busting
│   │       │   └── build/              # Build artifacts (minified, bundled)
│   │       ├── templates/               # HTML templates
│   │       │   ├── core/               # Base templates
│   │       │   │   ├── layout/        # Main layout templates
│   │       │   │   ├── fragments/     # Template fragments
│   │       │   │   └── error/         # Error page templates
│   │       │   ├── tenants/            # Tenant-specific templates
│   │       │   └── modules/            # Module-specific templates
│   │       └── uploads/                 # User-uploaded content
│   │           ├── tenants/            # Tenant-isolated uploads
│   │           │   └── products/      # Product images with processing
│   │           │       ├── original/   # Original uploads
│   │           │       ├── thumbnails/ # Generated thumbnails
│   │           │       └── resized/    # Resized versions
│   │           ├── documents/         # Business documents
│   │           ├── logos/             # Tenant logos
│   │           └── system/            # System-generated files
│   └── test/                           # Unit, integration, and E2E tests
│       ├── unit/                       # Unit tests
│       ├── integration/                # Integration tests
│       └── e2e/                        # End-to-end tests
├── scripts/                             # Build & deployment scripts
├── docker/                              # Docker configurations
├── ci-cd/                               # CI/CD pipelines
├── monitoring/                          # Monitoring and logging setup
└── pom.xml                              # Maven dependencies
```

### Key Dependencies (MVP)

-   `spring-boot-starter-web`: REST API and web functionality
-   `spring-boot-starter-data-jpa`: Database operations with JPA
-   `spring-boot-starter-security`: JWT authentication and authorization
-   `spring-boot-starter-data-redis`: Caching and session storage
-   `spring-boot-starter-validation`: Input validation
-   `mysql-connector-j`: MySQL database driver (8.0.33)
-   `flyway-mysql`: Database migration management
-   `jjwt-api/jjwt-impl/jjwt-jackson`: JWT token handling (0.12.3)
-   `lombok`: Reduces boilerplate code
-   `spring-boot-devtools`: Development-time auto-restart

## Configuration

### Application Properties

-   Main config file: `src/main/resources/application.yml`
-   Database configuration should be added here when connecting to MySQL

### Database Configuration

Add to `application.ymlproperties`:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/database_name
spring.datasource.username=username
spring.datasource.password=password
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
```

## Development Notes

### Code Style

-   Package structure follows Maven conventions: `fa.academy.kiotviet`
-   Architecture follows Clean Architecture principles with domain-driven design
-   Lombok is configured for annotation processing
-   Use Spring Boot's component scanning (@Component, @Service, @Repository, @Controller)
-   Multi-tenant architecture with account-based isolation
-   Role-based access control (ADMIN, MANAGER, STAFF)

### Response Handling Patterns

#### Standard API Response Structure
```java
// Success Response
public SuccessResponse<T> success(T data, String message) {
    return ResponseFactory.success(data, message);
}

// JSON Response Format
{
  "httpCode": 200,
  "message": "Operation successful",
  "data": { ... },
  "timestamp": "2025-11-06T10:30:00"
}
```

#### Global Exception Handling
- Use `@RestControllerAdvice` for centralized error handling
- Controllers should NOT catch exceptions - let them bubble up
- Custom exceptions extend `KiotvietException` base class
- Validation errors are handled automatically by `GlobalExceptionHandler`

#### Response Factory Usage
```java
// In controllers
public SuccessResponse<AuthResponse> registerUser(@Valid RegistrationRequest request) {
    AuthResponse response = authService.register(request);
    return ResponseFactory.success(response, "User registered successfully");
}
```

### DTO Package Organization

#### DTO Package Structure
- **shared/** - Common response wrappers and shared DTOs
  - `SuccessResponse.java`, `ErrorResponse.java`, `PagedResponse.java`
  - `common/` - Common data structures (UserInfoDto, AddressDto)
- **auth/** - Authentication-specific DTOs
  - `request/` - API request DTOs (RegistrationRequest)
  - `response/` - API response DTOs (AuthResponse)
- **form/** - HTML form objects (LoginForm, RegistrationForm)
- **[domain]/** - Domain-specific DTOs (user/, product/, inventory/)

#### DTO vs Model vs Entity
- **DTO**: Data transfer across system boundaries with validation
- **Model**: Internal data structures for processing
- **Entity**: Database persistence with JPA annotations

### Controller Organization

#### API vs Web Controllers
- **api/** - REST API controllers (@RestController)
  - Return JSON responses using SuccessResponse/ErrorResponse
  - Handle API request/response with proper HTTP semantics
  - Use `@RequestBody` for JSON input, `@Valid` for validation
- **web/** - Page rendering controllers (@Controller)
  - Return template names for HTML rendering
  - Handle form submissions with `@ModelAttribute`
  - Support traditional web applications

#### Controller Growth Strategy
- Keep flat structure until 8-10 controllers
- Then organize by domain (auth/, users/, products/, etc.)
- Use `shared/` for common controller utilities

### Modern Dependency Injection

#### Use @RequiredArgsConstructor
```java
@Service
@RequiredArgsConstructor  // Generates constructor with final fields
public class AuthService {
    private final UserRepository userRepository;  // No @Autowired needed
    private final EmailService emailService;

    // Business logic methods
}
```

#### Benefits
- **Immutability**: Dependencies can't be changed after construction
- **Testability**: Easy to create instances with mocks
- **Compile-time Safety**: Missing dependencies caught at compile time
- **Clean Code**: Less annotation clutter, clear dependency visibility

#### Migration from @Autowired
```java
// OLD (avoid):
@Autowired
private UserRepository userRepository;

// NEW (recommended):
private final UserRepository userRepository;
```

## Architecture Decisions

### Domain-First Architecture

#### Decision: Organize by Business Domain Instead of Technical Layer
- **Rationale**: Each business domain (tenant, usermanagement, productcatalog) has its own complete substructure
- **Benefits**: Clear ownership, easier team collaboration, natural scalability
- **Implementation**: Each domain contains domain/, repository/, service/, exception/ packages

#### Why Not Flat Structure
- Flat structure becomes unmanageable with 30+ controllers/services
- No clear boundaries between business areas
- Difficult to assign team ownership
- Poor scalability as project grows

### DTO vs Entity vs Model

#### DTO (Data Transfer Object)
- **Purpose**: Transfer data across system boundaries
- **Characteristics**: Validation annotations, JSON serialization, API contracts
- **Usage**: API requests/responses, form submissions
- **Example**: `RegistrationRequest`, `AuthResponse`

#### Entity
- **Purpose**: Database persistence
- **Characteristics**: JPA annotations, database mapping, relationships
- **Usage**: Data access layer, database operations
- **Example**: `UserEntity`, `ProductEntity`

#### Model
- **Purpose**: Internal data processing
- **Characteristics**: Business logic, temporary state, calculations
- **Usage**: Service layer business operations
- **Example**: `UserCreationModel`, `ProductPricingModel`

### API vs Web Controller Separation

#### API Controllers (@RestController)
- **Purpose**: Serve REST APIs for SPA/mobile clients
- **Return**: JSON responses with SuccessResponse/ErrorResponse wrapper
- **Input**: @RequestBody with JSON payloads
- **Example**: `/api/auth/register`

#### Web Controllers (@Controller)
- **Purpose**: Render HTML pages for traditional web apps
- **Return**: Template names that render to HTML
- **Input**: @ModelAttribute with form objects
- **Example**: `/auth/register` (HTML page)

### Global Exception Handling Strategy

#### Decision: Centralized Exception Handling with @RestControllerAdvice
- **Rationale**: Controllers should focus on business logic, not error handling
- **Benefits**: Consistent error responses, clean controllers, easy maintenance
- **Implementation**: `GlobalExceptionHandler` handles all exceptions automatically
- **Pattern**: Throw custom exceptions, never catch in controllers

### Modern Dependency Injection

#### Decision: Constructor Injection with @RequiredArgsConstructor
- **Rationale**: Immutability, testability, compile-time safety
- **Benefits**: Final dependencies, easier mocking, no reflection overhead
- **Migration**: Replace @Autowired field injection with constructor injection
- **Example**: All dependencies are final and injected via generated constructor

## Testing

### Testing with New Architecture

#### Unit Testing Services
```java
@ExtendWith(MockitoExtension.class)
class AuthServiceTest {
    @Mock private UserRepository userRepository;
    @Mock private EmailService emailService;

    private AuthService authService;

    @BeforeEach
    void setUp() {
        authService = new AuthService(userRepository, emailService, ...);
    }

    @Test
    void testRegisterUser() {
        // Test business logic without Spring context
    }
}
```

#### Integration Testing Controllers
```java
@WebMvcTest(AuthApiController.class)
class AuthApiControllerTest {
    @Autowired private MockMvc mockMvc;
    @MockBean private AuthService authService;

    @Test
    void testRegisterEndpoint() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"test@example.com\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email").value("test@example.com"));
    }
}
```

### Development Tools

-   Spring Boot DevTools enables automatic restart on code changes
-   Maven compiler plugin configured with Lombok annotation processor
-   Spring Boot Maven plugin for executable JAR creation

### Frontend Asset Organization

-   **Core Assets**: Shared resources across all tenants (`static/core/`)
-   **Tenant Customization**: Complete UI customization per tenant (`static/tenants/`)
-   **Module-Based**: Feature-specific assets organized by business domain (`static/modules/`)
-   **Version Management**: Cache-busting with versioned directories (`static/versions/`)
-   **Image Processing**: Automated thumbnail generation and resizing (`uploads/tenants/`)
-   **Multi-Tenant Support**: Asset isolation and dynamic loading per tenant

### Team Role Organization

#### Backend Developers
- **API Development**: `application/controller/api/`, `application/dto/`
- **Business Logic**: `core/[domain]/service/`, `core/[domain]/domain/`
- **Data Access**: `core/[domain]/repository/`
- **Integration**: `infrastructure/external/`, `infrastructure/persistence/`

#### Security Specialists
- **Authentication**: `infrastructure/security/`, `core/usermanagement/`
- **Authorization**: `config/SecurityConfig.java`, `GlobalExceptionHandler.java`
- **JWT Implementation**: `infrastructure/security/JwtUtil.java`
- **Multi-tenant Security**: Tenant isolation and access control

#### Database Architects
- **Domain Modeling**: `core/[domain]/domain/` entities
- **Schema Design**: `src/main/resources/db/migration/`
- **Performance**: Database indexing, query optimization
- **Multi-tenant Design**: Account isolation strategies

#### Frontend Developers
- **API Controllers**: `application/controller/web/` (HTML pages)
- **Templates**: `src/main/resources/templates/`
- **Static Assets**: `src/main/resources/static/`
- **Form Objects**: `application/dto/form/`

#### Full-Stack Developers
- **End-to-End Features**: Complete domains (auth, products, inventory)
- **DTO Design**: `application/dto/[domain]/`
- **Service Integration**: API ↔ Web controller coordination
- **Testing**: Integration and E2E tests

#### QA Engineers
- **Unit Tests**: `src/test/unit/` - business logic validation
- **Integration Tests**: `src/test/integration/` - API endpoint testing
- **E2E Tests**: `src/test/e2e/` - complete user workflows
- **API Testing**: Postman/Swagger documentation validation

#### DevOps Engineers
- **CI/CD**: `ci-cd/`, deployment pipelines
- **Docker**: `docker/`, container orchestration
- **Monitoring**: `monitoring/`, logging setup
- **Scripts**: `scripts/`, build automation

#### Domain Experts (Business Stakeholders)
- **Requirements**: Domain-specific business rules
- **Validation**: Review DTO structures and business logic
- **User Stories**: Feature specifications and acceptance criteria

## Authentication System (JWT-Based Client-Side Architecture)

### Authentication Architecture Decision

#### Decision: Client-Side JWT Authentication with Shared JavaScript Manager
- **Rationale**: Avoid mixing JWT authentication with Spring Security form authentication
- **Benefits**: Simplified security config, consistent authentication state across all pages, automatic redirect handling
- **Implementation**: Centralized JavaScript authentication manager with localStorage token storage
- **Key Principle**: "authentication based on the JWT. Please focus on it. dont rely too much in spring security"

### Core Authentication Components

#### 1. Shared Authentication JavaScript (`/static/core/js/auth.js`)
**Location**: `src/main/resources/static/core/js/auth.js`
**Purpose**: Centralized authentication management for all pages
**Key Features**:
- JWT token storage and management (localStorage)
- Automatic authentication status checking
- Protected page access control with redirects
- UI updates based on authentication state
- Token refresh handling
- Centralized logout functionality

**Core Class**: `KiotVietAuth`
```javascript
class KiotVietAuth {
    constructor() {
        this.tokenKey = 'jwtToken';
        this.refreshTokenKey = 'refreshToken';
        this.userInfoKey = 'userInfo';
        this.apiBaseUrl = '/api/auth';
    }

    // Key methods:
    async isAuthenticated()     // Validates stored token via /api/auth/me
    async requireAuth()        // Redirects to login if not authenticated
    async handleLogin(data)    // Processes login response and stores tokens
    async logout()            // Clears tokens and redirects to login
    updateUIForAuthenticatedUser(userInfo) // Updates UI elements
}
```

#### 2. Automatic Authentication Flow
**Page Load Process**:
1. DOM ready → `kiotVietAuth.init()` called automatically
2. Check if current page requires authentication (`isProtectedPage()`)
3. If protected → `requireAuth()` validates token via `/api/auth/me`
4. If invalid/missing → redirect to `/login?redirect={currentUrl}`
5. If valid → update UI with user information

**Protected Routes**: `/dashboard`, `/profile`, `/settings`
**Authentication Check**: Calls `/api/auth/me` with Bearer token to validate

#### 3. Login and Registration Integration
**Login Form** (`/auth/login`):
- Uses shared auth manager for form submission
- Handles login success with automatic redirect to dashboard
- Supports redirect parameter for post-login navigation
- Stores JWT tokens in localStorage on successful authentication

**Registration Form**:
- Similar integration with shared auth manager
- Automatic login after successful registration
- Token storage and UI updates handled centrally

#### 4. UI Update System
**Dynamic UI Elements**:
- **Navbar**: Shows user dropdown with username when authenticated
- **Hero Section**: Updates CTAs for authenticated users
- **Trust Indicators**: Displays welcome message and user role
- **Dashboard Access**: Shows "Enter Dashboard" button for authenticated users

**UI Update Methods**:
```javascript
updateNavbarForAuthenticatedUser(userInfo)     // User dropdown in navbar
updateHeroSectionForAuthenticatedUser(userInfo) // Dashboard CTA in hero
updateTrustIndicators(userInfo)                // Welcome message and role
updateDashboardAccessButton(userInfo)          // Dashboard entry button
```

### Authentication Workflow Examples

#### User Login Flow
1. User navigates to `/login` → redirected to `/auth/login`
2. User submits credentials → AJAX to `/api/auth/login`
3. Success response → tokens stored in localStorage
4. UI updated with user information
5. Automatic redirect to dashboard (or original destination)

#### Protected Page Access
1. User navigates to `/dashboard`
2. `kiotVietAuth.init()` → calls `requireAuth()`
3. `isAuthenticated()` → validates token via `/api/auth/me`
4. If valid → page loads with personalized UI
5. If invalid → redirect to login with return URL

#### Automatic Token Management
1. Token stored with key: `jwtToken`
2. Refresh token stored with key: `refreshToken`
3. User info cached with key: `userInfo`
4. All tokens cleared on logout
5. Authentication state persists across browser sessions

### Integration Guidelines for Developers

#### Adding New Pages
1. **Include Auth Script**: Ensure `/core/js/auth.js` is loaded
2. **Protected Pages**: Add route to `isProtectedPage()` if authentication required
3. **UI Updates**: Use `kiotVietAuth.updateUIIfAuthenticated()` for dynamic content
4. **API Calls**: Use `kiotVietAuth.authenticatedFetch()` for authenticated requests

#### Example Page Integration
```html
<!-- In template head -->
<script th:src="@{/core/js/auth.js}"></script>

<!-- In page content -->
<div id="userSection">
    <!-- Will be updated by auth manager -->
</div>

<script>
document.addEventListener('DOMContentLoaded', () => {
    // Auth manager auto-initializes
    // Add custom auth logic here if needed
});
</script>
```

#### API Integration
```javascript
// Making authenticated API calls
const response = await kiotVietAuth.authenticatedFetch('/api/products', {
    method: 'GET'
});

// Manual authentication check
if (await kiotVietAuth.isAuthenticated()) {
    // User is authenticated
} else {
    // Redirect to login
}
```

### Security Considerations

#### Token Storage
- **Location**: Browser localStorage (client-side storage)
- **Access Token**: 15-minute expiration
- **Refresh Token**: 7-day expiration
- **Auto-clear**: Tokens cleared on logout and authentication failures

#### Route Protection
- **Server-side**: Spring Security permits dashboard access
- **Client-side**: JavaScript authentication manager validates tokens
- **Automatic Redirects**: Unauthenticated users redirected to login
- **Protected Routes**: Defined in `isProtectedPage()` method

#### API Security
- **JWT Validation**: `/api/auth/me` endpoint validates stored tokens
- **Automatic Invalidation**: Failed validation clears invalid tokens
- **Bearer Tokens**: All authenticated API calls use Authorization header
- **Error Handling**: Authentication failures trigger automatic logout

### Troubleshooting Authentication Issues

#### Common Issues and Solutions

**Issue: User stuck in login redirect loop**
- **Cause**: Invalid token stored, authentication check failing
- **Solution**: Clear localStorage tokens, check `/api/auth/me` endpoint

**Issue: UI not updating after login**
- **Cause**: Auth manager not properly initialized or integrated
- **Solution**: Ensure auth script loaded, check `updateUIForAuthenticatedUser()` calls

**Issue: Protected pages accessible without authentication**
- **Cause**: Client-side check bypassed, server-side permits access
- **Solution**: Verify `isProtectedPage()` includes route, check Spring Security config

**Debugging Steps**:
1. Check browser console for authentication errors
2. Verify localStorage contains valid tokens
3. Test `/api/auth/me` endpoint directly
4. Confirm auth script is loaded on page
5. Check for JavaScript errors blocking auth manager initialization

Less code is better than more code.

No fallback mechanisms — they hide real failures.

Rewrite existing components over adding new ones.

Flag obsolete files to keep the codebase lightweight.

Avoid race conditions at all costs.

Always output the full component unless told otherwise.

Never say “X remains unchanged” — always show the code.

Be explicit on where snippets go (e.g., below “abc”, above “xyz”).

If only one function changes, just show that one.

Take your time to ultrathink when on extended thinking mode — thinking is cheaper than fixing bugs.

Update CLAUDE.md after complete a big changes. Alway let claude memory up to date.

-   when complate a task please go to @plan-progress.md and tick for completion and git commit the project.

-   read docs/CLAUDE_RULES.md everytime to understand the rule for every session.
