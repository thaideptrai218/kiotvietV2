# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Kiotviet-style multi-tenant product management system for large retail sellers in Vietnam, built with Spring Boot 3.5.7 and Java 17. The system is designed to handle 1000+ products per account with high-concurrency requirements and features hierarchical categories, supplier management, real-time inventory tracking, and scalable search capabilities.

### Project Status

- **Current Phase**: MVP Implementation (Week 1 of 6)
- **Progress**: Database schema simplified and documented for MVP
- **Timeline**: November 5 - December 17, 2025
- **Target**: Production-ready MVP for pilot testing

### Business Model & Scale

- **Target**: Large retail sellers with multiple store locations
- **Multi-tenant**: Account-based isolation with high-security requirements
- **Scale**: 1000+ products per account, 100+ concurrent users per tenant
- **Performance**: <500ms product search (MVP target), <2s page load
- **Architecture**: MySQL + Redis stack for MVP, Elasticsearch post-MVP

## Development Commands

### Build and Run

- **Build project**: `./mvnw clean compile`
- **Run application**: `./mvnw spring-boot:run`
- **Package JAR**: `./mvnw clean package`
- **Run tests**: `./mvnw test`
- **Run specific test**: `./mvnw test -Dtest=ClassName`

### Database Operations

- **Run database migrations**: `./mvnw flyway:migrate`
- **Check migration status**: `./mvnw flyway:info`
- **Repair database after failed migration**: `./mvnw flyway:repair`

### Maven Wrapper

- Use `./mvnw` (Linux/Mac) or `mvnw.cmd` (Windows) instead of `mvn` to ensure consistent Maven version

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

### Testing API Endpoints

```bash
# Test authentication endpoint
curl -X POST http://localhost:8080/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"companyName":"Test Company","email":"test@example.com","username":"testuser","password":"TestPass123!"}'

# Test with authentication
curl -X GET http://localhost:8080/api/users/me \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Architecture

### Technology Stack

- **Framework**: Spring Boot 3.5.7 with Java 17
- **Database**: MySQL 8.0 with Spring Data JPA + Flyway migrations
- **Cache**: Redis 7.0 for session management and caching
- **Security**: Spring Security + JWT authentication
- **Frontend**: HTML5 + JavaScript (AJAX) + Bootstrap 5.3
- **Image Storage**: Local filesystem (`/uploads/`) for MVP
- **Search**: MySQL FULLTEXT (MVP), Elasticsearch post-MVP
- **Build Tool**: Maven 3.9
- **Code Quality**: Lombok for boilerplate reduction

### Project Structure (Domain-First Enterprise Architecture)

```
src/main/java/fa/academy/kiotviet/
├── application/           # Application layer
│   ├── controller/        # Web controllers (API + Web)
│   │   ├── api/          # REST API controllers
│   │   └── web/          # Page rendering controllers
│   ├── dto/              # Data transfer objects
│   │   ├── shared/       # Shared response wrappers
│   │   ├── auth/         # Authentication DTOs
│   │   ├── form/         # HTML form objects
│   │   └── [domain]/     # Domain-specific DTOs
│   └── service/          # Application services
├── core/                 # Domain layer (domain-first organization)
│   ├── tenant/          # Multi-tenant domain
│   ├── usermanagement/  # User management domain
│   ├── productcatalog/  # Product catalog domain
│   ├── inventory/       # Inventory management domain
│   ├── suppliers/       # Supplier management domain
│   └── shared/          # Shared domain components
├── infrastructure/       # Infrastructure layer
│   ├── security/        # Security implementation
│   ├── persistence/     # JPA implementations
│   └── external/        # Third-party integrations
└── config/              # Configuration classes
```

### Key Architecture Decisions

#### Domain-First Architecture
- Decision: Organize by business domain instead of technical layer
- Benefits: Clear ownership, easier team collaboration, natural scalability
- Implementation: Each domain contains domain/, repository/, service/, exception/ packages

#### Multi-Tenant Data Isolation
- Strategy: JPA-level automatic account_id filtering
- Implementation: Base entity classes with automatic tenant filtering
- Security: Row-level security enforced at application layer

#### Authentication System
- JWT-based authentication with refresh tokens (15min access, 7day refresh)
- Centralized JavaScript authentication manager for client-side state
- Automatic token management and protected route handling

#### Response Handling Patterns
- Standardized API responses using SuccessResponse/ErrorResponse wrappers
- Global exception handling with @RestControllerAdvice
- ResponseFactory for centralized response creation

## Configuration

### Application Properties

- **Main config**: `src/main/resources/application.yml`
- **Database**: MySQL on localhost:33006/kiotviet_db
- **Redis**: localhost:6379
- **JWT**: 15-minute access tokens, 7-day refresh tokens
- **Mail**: Gmail SMTP for password resets

### Database Configuration

Database is managed through Flyway migrations in `src/main/resources/db/migration/`:
- V1: Core user management tables
- V2: Password reset functionality
- V3: Supplier management
- V4: Product categories

## Development Patterns

### Code Style

- Package structure: `fa.academy.kiotviet`
- Architecture: Clean Architecture with domain-driven design
- Dependency injection: Constructor injection with @RequiredArgsConstructor (not @Autowired)
- Multi-tenant: Account-based isolation with automatic filtering
- Security: Role-based access control (ADMIN, MANAGER, STAFF)

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

### Response Handling

```java
// Standard API response
public SuccessResponse<T> success(T data, String message) {
    return ResponseFactory.success(data, message);
}

// Controllers should NOT catch exceptions - let them bubble up
// Use GlobalExceptionHandler for centralized error handling
```

### DTO vs Entity vs Model

- **DTO**: Data transfer across system boundaries with validation
- **Entity**: Database persistence with JPA annotations
- **Model**: Internal data structures for processing

## Critical Working Rules

### Task Completion Process
1. Read existing implementation files before starting any task
2. Always use TodoWrite tool for task tracking
3. Apply brainstorming before coding for complex features
4. Use test-driven development when appropriate
5. After completing ANY task, immediately update `/home/welterial/haizz/kiotviet/plan-progress.md`
6. Double-check verification against original requirements
7. Use Context7 MCP for latest language documentation

### Code Review Guidelines
- Actions speak louder than words - show fixes in code
- Avoid gratitude expressions ("Thanks", "Great point")
- State corrections factually and move on
- Focus on technical solutions, not social pleasantries

### Multi-Tenant Development Patterns
- All database queries must filter by account_id
- Use automatic tenant filtering in repository layer
- Validate tenant access in service layer
- Never return data from other tenants

## Testing

### Current Test Coverage
- Basic Spring Boot test structure in place
- Need comprehensive unit tests for service layer
- Integration tests for API endpoints required
- Security testing for authentication flows needed

### Testing Commands
```bash
# Run all tests
./mvnw test

# Run specific test class
./mvnw test -Dtest=AuthServiceTest

# Run tests with coverage report
./mvnw test jacoco:report
```

### Development Tools

- Spring Boot DevTools enables automatic restart on code changes
- Maven compiler plugin configured with Lombok annotation processor
- Spring Boot Maven plugin for executable JAR creation

## Security Implementation

### JWT Authentication Flow
1. User login → JWT tokens generated (access + refresh)
2. Access token (15min) used for API calls
3. Refresh token (7days) used to renew access
4. Client-side JavaScript manages token storage and validation
5. Automatic logout on token expiration

### Security Best Practices
- All endpoints except /api/auth/** require authentication
- Role-based authorization for different user types
- Multi-tenant data isolation enforced at database level
- Password hashing with BCrypt
- Protection against common web vulnerabilities

## Performance Considerations

### Database Optimization
- Connection pooling with HikariCP (max 10 connections)
- Query optimization with proper indexing
- Flyway migrations for schema management

### Caching Strategy
- Redis for session storage and frequently accessed data
- Cache-aside pattern implementation planned
- JWT token storage in Redis for scalability

### Response Time Targets
- API responses: <200ms average
- Page loads: <2s (95th percentile)
- Product search: <500ms (MVP target)

## Progress Tracking

Current implementation progress is tracked in `docs/plan-progress.md`:
- **Overall**: 8% complete (13/168 tasks)
- **Current Week**: Week 1 - Project Setup & Foundation (48% complete)
- **Next Milestone**: Complete authentication system

### After Task Completion
1. Mark tasks complete in `plan-progress.md` with `[x]`
2. Update TodoWrite to reflect completion
3. Double-check implementation against requirements
4. Commit changes with descriptive message

## Troubleshooting

### Common Development Issues

**Database Connection Issues**:
- Verify MySQL Docker container is running on port 33006
- Check database credentials in application.yml
- Run `./mvnw flyway:info` to check migration status

**Authentication Issues**:
- Verify JWT secret is configured in application.yml
- Check Redis connection for token storage
- Review SecurityConfig for endpoint permissions

**Build Issues**:
- Ensure Java 17 is being used (`java -version`)
- Clean and rebuild: `./mvnw clean compile`
- Check Lombok annotation processor configuration

### Debug Commands

```bash
# Check database connectivity
./mvnw spring-boot:run -Dspring-boot.run.arguments="--spring.datasource.url=jdbc:mysql://localhost:33006/kiotviet_db"

# Test specific endpoints
curl -X GET http://localhost:8080/api/test/health

# View application logs
./mvnw spring-boot:run 2>&1 | grep DEBUG
```