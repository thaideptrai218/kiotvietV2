# KiotvietV2 - System Architecture

**Version**: 1.0
**Date**: February 6, 2026
**Architecture Type**: Domain-First Enterprise Architecture

---

## Executive Summary

KiotvietV2 uses a **Domain-First Enterprise Architecture** with Clean Architecture principles, organizing code by business domains rather than technical layers. This architecture provides clear ownership, scalability, and maintainability for a multi-tenant product management system.

**Key Architectural Decisions**:
- Multi-tenant SaaS with row-level security
- Spring Boot 3.5.7 with Java 21
- MySQL 8.0 for primary data storage
- Redis 7.0 for caching and session management
- 12 business domains (8 fully implemented, 4 in progress)

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                         CLIENT BROWSER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │  HTML Pages  │  │  JavaScript  │  │  CSS Styles  │              │
│  │  (Thymeleaf) │  │   (AJAX)     │  │  (Bootstrap) │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
└────────────────────────┬────────────────────────────────────────────┘
                         │ HTTPS + JWT Token
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    SPRING BOOT APPLICATION                          │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    SECURITY LAYER                            │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │  │
│  │  │JwtAuthFilter │  │SecurityConfig │  │AccessControl │       │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘       │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                 APPLICATION LAYER                             │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │  │
│  │  │ Controllers  │──│   Services   │──│    DTOs      │       │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘       │  │
│  └──────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    CORE LAYER (DOMAIN-FIRST)                 │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐       │  │
│  │  │ Entities     │──│Repositories  │──│DomainServices│       │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘       │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────┬────────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        ▼                ▼                ▼
┌───────────────┐ ┌───────────────┐ ┌───────────────┐
│    MySQL      │ │    Redis      │ │    Filesystem │
│   Database    │ │     Cache     │ │   Storage     │
└───────────────┘ └───────────────┘ └───────────────┘
```

---

## Layered Architecture

### Layer 1: Client Layer

**Purpose**: User interface and interaction

**Components**:
- **HTML Templates**: Thymeleaf templates for server-side rendering
- **JavaScript Modules**: Vanilla JavaScript for AJAX interactions
- **CSS Framework**: Bootstrap 5.3 for responsive styling

**Responsibilities**:
- Display content to users
- Collect user input
- Communicate with backend via AJAX
- Handle user interactions and state

**Technology Stack**:
- Thymeleaf template engine
- Bootstrap 5.3
- Vanilla JavaScript (ES6+)
- Fetch API for HTTP requests

### Layer 2: Security Layer

**Purpose**: Authentication and authorization

**Components**:
- **JWT Authentication Filter**: Validates JWT tokens on protected endpoints
- **Security Configuration**: Spring Security filter chain setup
- **Access Control**: Role-based authorization (ADMIN, MANAGER, STAFF)

**Responsibilities**:
- Validate JWT tokens
- Extract user claims (userId, accountId, role)
- Check user permissions for each endpoint
- Enforce multi-tenant isolation
- Handle authentication failures

**Security Flow**:
```
1. Client sends request with JWT token in Authorization header
2. JwtAuthenticationFilter extracts token
3. JwtService validates token signature and expiration
4. User context is loaded from user_tokens table (Redis + MySQL)
5. Claims are extracted and stored in SecurityContext
6. FilterSecurityInterceptor checks if user has required role
7. If authorized, request proceeds to controller
8. If unauthorized, 401/403 response is returned
```

### Layer 3: Application Layer

**Purpose**: Application business logic and data transfer

**Components**:
- **Controllers**: Handle HTTP requests and responses
- **Services**: Application-level business logic
- **DTOs**: Data transfer objects for API communication

**Responsibilities**:
- Parse HTTP requests
- Validate input data
- Orchestrate business operations
- Convert between entities and DTOs
- Handle errors and return responses
- Coordinate service layer interactions

**Architecture Pattern**:
- **Controller Pattern**: Handles HTTP requests/responses
- **Service Pattern**: Contains application business logic
- **DTO Pattern**: Separates internal entities from API contracts

### Layer 4: Core Layer (Domain-First)

**Purpose**: Business domain logic and entities

**Components**:
- **Entities**: JPA entities representing database tables
- **Repositories**: Data access interfaces (Spring Data JPA)
- **Domain Services**: Business logic specific to a domain
- **Exceptions**: Custom exception types

**Responsibilities**:
- Define business domain models
- Implement data access operations
- Enforce business rules
- Handle data validation
- Coordinate domain-specific operations

**Domain-First Organization**:
```
core/
├── usermanagement/          # User management domain
│   ├── entity/
│   │   ├── Account.java
│   │   ├── UserInfo.java
│   │   ├── UserAuth.java
│   │   └── UserToken.java
│   ├── repository/
│   │   ├── AccountRepository.java
│   │   ├── UserInfoRepository.java
│   │   └── UserTokenRepository.java
│   ├── service/
│   │   ├── AuthService.java
│   │   └── RegistrationService.java
│   └── exception/
│       └── UserNotFoundException.java
├── productcatalog/          # Product catalog domain
│   ├── entity/
│   │   ├── Product.java
│   │   ├── ProductImage.java
│   │   └── Category.java
│   ├── repository/
│   │   ├── ProductRepository.java
│   │   └── CategoryRepository.java
│   └── service/
│       └── ProductService.java
├── inventory/               # Inventory management domain
│   ├── entity/
│   │   ├── Inventory.java
│   │   └── InventoryTransaction.java
│   ├── repository/
│   │   ├── InventoryRepository.java
│   │   └── InventoryTransactionRepository.java
│   └── service/
│       └── InventoryService.java
└── ...
```

**Benefits of Domain-First**:
- Clear ownership of business domains
- Easier team collaboration (separate domains)
- Natural scalability (add new domains)
- Business-aligned code structure
- Better testability (domain-focused tests)

### Layer 5: Infrastructure Layer

**Purpose**: External technology implementations

**Components**:
- **Persistence**: JPA entity base class, base repository interface
- **Security**: JWT service, authentication filter
- **Storage**: File storage service
- **External Integrations**: Third-party services

**Responsibilities**:
- Implement data access with JPA
- Handle external integrations
- Manage file uploads
- Implement security mechanisms
- Provide cache layer integration

**Technology Stack**:
- Spring Data JPA
- Hibernate
- JWT (jjwt library)
- Local filesystem for image storage

---

## Multi-Tenancy Architecture

### Strategy: Row-Level Security with Account Isolation

**Approach**: Single database instance with row-level security enforced at application level

**Why this approach**:
- Cost-effective for MVP (single database instance)
- Simpler backup/restore operations
- Easier to maintain than database-per-tenant
- Sufficient security with proper application-level checks

**Implementation**:

```java
// 1. Every table has account_id column
@Entity
@Table(name = "products")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long accountId;  // Multi-tenant isolation

    // ... other fields
}

// 2. Account context injection in repositories
@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    @Query("SELECT p FROM Product p WHERE p.accountId = :accountId AND p.status = :status")
    List<Product> findByAccountIdAndStatus(@Param("accountId") Long accountId,
                                          @Param("status") ProductStatus status);

    @Query("SELECT p FROM Product p WHERE p.accountId = :accountId")
    Page<Product> findByAccountId(@Param("accountId") Long accountId, Pageable pageable);
}

// 3. Account isolation check in services
@Service
public class ProductService {
    public ProductDTO getProduct(Long productId, Long accountId) {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new ProductNotFoundException(productId));

        // Critical: Check account isolation
        if (!product.getAccountId().equals(accountId)) {
            throw new ForbiddenException("Access to this product is forbidden");
        }

        return convertToDTO(product);
    }

    @Transactional
    public ProductDTO createProduct(ProductForm form, Long accountId) {
        // Validate account ownership
        Account account = accountRepository.findById(accountId)
            .orElseThrow(() -> new AccountNotFoundException(accountId));

        // Create product with account_id
        Product product = Product.builder()
            .accountId(accountId)
            .sku(form.getSku())
            .name(form.getName())
            .build();

        return convertToDTO(productRepository.save(product));
    }
}

// 4. JWT token includes account_id
@Service
public class JwtService {
    public String generateToken(UserDetails userDetails) {
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("accountId", ((KiotvietUserDetails) userDetails).getAccountId());
        // ... generate JWT
    }

    public Long extractAccountId(String token) {
        return extractClaim(token, claims -> claims.get("accountId", Long.class));
    }
}
```

### Multi-Tenancy Features

**Authentication Flow**:
1. User registers → Account created with `accountId`
2. User logs in → JWT token generated with `accountId` claim
3. JWT sent with every request
4. JwtAuthenticationFilter extracts `accountId`
5. Account context used throughout request processing

**Data Isolation Layers**:
1. **Database Level**: `account_id` column in every table (FK constraint)
2. **Repository Level**: All queries filter by `account_id`
3. **Service Level**: Account access validation before operations
4. **JWT Level**: `accountId` embedded in token for security

**Security Considerations**:
- Account isolation enforced at ALL layers
- No "orphaned" data possible
- Hard to bypass isolation (requires modifying queries)
- Audit trail preserved per account
- Easy to implement per-account quotas

---

## Database Architecture

### Schema Design Principles

1. **Multi-Tenancy**: Every table includes `account_id`
2. **Audit Trail**: `created_at`, `updated_at` timestamps
3. **Soft Deletes**: Status-based deletion (active/inactive/draft)
4. **Index Strategy**: Composite indexes on frequently queried combinations
5. **Constraints**: Foreign keys for referential integrity

### Core Database Tables

#### 1. accounts (Tenant Management)

```sql
CREATE TABLE accounts (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    business_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    phone VARCHAR(20),
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);
```

#### 2. user_info (User Profiles)

```sql
CREATE TABLE user_info (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    account_id BIGINT NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL,  -- ADMIN, MANAGER, STAFF
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_account_email (account_id, email),
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE
);
```

#### 3. user_auth (Authentication)

```sql
CREATE TABLE user_auth (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    salt VARCHAR(255) NOT NULL,
    failed_login_attempts INT DEFAULT 0,
    last_login_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES user_info(id) ON DELETE CASCADE
);
```

#### 4. products (Product Catalog)

```sql
CREATE TABLE products (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    account_id BIGINT NOT NULL,
    sku VARCHAR(100) NOT NULL,
    barcode VARCHAR(50),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id BIGINT,
    supplier_id BIGINT,
    cost_price DECIMAL(15, 2) NOT NULL,
    selling_price DECIMAL(15, 2) NOT NULL,
    unit VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    FOREIGN KEY (supplier_id) REFERENCES suppliers(id) ON DELETE SET NULL,
    UNIQUE KEY uk_account_sku (account_id, sku),
    FULLTEXT KEY ft_name (name),
    INDEX idx_account_status (account_id, status),
    INDEX idx_account_name (account_id, name)
);
```

#### 5. inventory (Stock Tracking)

```sql
CREATE TABLE inventory (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    account_id BIGINT NOT NULL,
    product_id BIGINT NOT NULL UNIQUE,
    current_stock INT NOT NULL DEFAULT 0,
    min_stock_level INT NOT NULL DEFAULT 0,
    max_stock_level INT NOT NULL DEFAULT 100,
    version INT NOT NULL DEFAULT 0,  -- Optimistic locking
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_account_stock (account_id, current_stock)
);
```

### Indexing Strategy

**Primary Indexes** (Most Common Queries):
```sql
-- Product queries by account and status
INDEX idx_account_status (account_id, status)

-- Product search
INDEX idx_account_name (account_id, name)

-- Product lookup by SKU/barcode
INDEX idx_account_sku (account_id, sku)
INDEX idx_account_barcode (account_id, barcode)

-- Inventory queries
INDEX idx_account_stock (account_id, current_stock)

-- Transaction history
INDEX idx_account_product_date (account_id, product_id, created_at)
```

**Secondary Indexes** (Joins and Sorts):
```sql
-- Category hierarchy
INDEX idx_category_parent (parent_id)

-- Supplier lookups
INDEX idx_supplier_status (account_id, status)
```

**Full-Text Search**:
```sql
FULLTEXT KEY ft_name (name)  -- For product name search
```

---

## Caching Architecture

### Strategy: Cache-Aside Pattern

**Approach**: Application checks cache first, populates cache on cache miss

**Benefits**:
- Simple implementation
- Cache is always consistent with database
- Graceful degradation when cache is down
- Easy to scale (Redis handles many requests)

### Cache-Aside Flow

```
1. Client requests product details
2. Check Redis cache for product:{accountId}:{productId}
3. If found → Return cached data
4. If not found → Query database
5. Store result in Redis with TTL (5-30 min)
6. Return data to client
```

### Cache Invalidation

**Event-Driven Invalidation**:
```java
@Service
public class ProductService {
    @CacheEvict(value = "product", key = "#productId")
    public ProductDTO updateProduct(Long productId, ProductForm form, Long accountId) {
        // Update product in database
        Product product = updateProductInDatabase(productId, form, accountId);
        return convertToDTO(product);
    }
}
```

### What to Cache

| Data Type | Cache? | TTL | Invalidation |
|-----------|--------|-----|--------------|
| Products | ✅ Yes | 10 min | Product update/delete |
| Categories | ✅ Yes | 30 min | Category update/delete |
| Suppliers | ✅ Yes | 30 min | Supplier update/delete |
| Inventory | ❌ NO | - | Too critical, always real-time |
| Search Results | ✅ Yes | 5 min | Product updates |
| User Sessions | ✅ Yes | 7 days | Logout |

### Redis Key Design

**Naming Convention**: `{entity}:{accountId}:{identifier}`

```
Examples:
- product:123:456              # Product 456 for account 123
- category_tree:123            # Full category tree for account 123
- search:123:iphone            # Search results for "iphone" in account 123
- refresh_token:abc-def-ghi    # Refresh token
```

### Graceful Degradation

**If Redis is unavailable**:
1. Application continues working
2. All reads go directly to database
3. No caching (slower but functional)
4. Warning logged to console
5. Automatic retry when Redis comes back

---

## Authentication & Authorization

### JWT Token Strategy

**Two-Token System**:

| Token Type | Storage | Lifespan | Purpose |
|------------|---------|----------|---------|
| Access Token | httpOnly Cookie | 15 minutes | API authorization |
| Refresh Token | httpOnly Cookie + Redis + MySQL | 7 days | Token renewal |

**Access Token Claims**:
```json
{
  "sub": "user-id-123",
  "accountId": "account-id-456",
  "role": "MANAGER",
  "exp": "2026-02-06T08:30:00Z",
  "iat": "2026-02-06T08:15:00Z"
}
```

**Token Flow**:

```
Login Flow:
1. User submits email + password
2. Backend validates credentials
3. Generates access token (15 min) + refresh token (7 days)
4. Stores refresh token in Redis + MySQL
5. Sets both tokens as httpOnly cookies
6. Returns user info + account info to frontend

Token Refresh Flow:
1. Frontend detects 401 (access token expired)
2. Automatically calls /api/auth/refresh with refresh token cookie
3. Backend validates refresh token (check Redis → MySQL)
4. Generates new access token
5. Sets new access token cookie
6. Retries original request

Logout Flow:
1. Frontend calls /api/auth/logout with refresh token cookie
2. Backend invalidates refresh token in Redis + MySQL
3. Clears access token cookie
4. Redirects to login page
```

### Authorization

**Role-Based Access Control** (RBAC):

| Role | Permissions | Use Case |
|------|-------------|----------|
| ADMIN | Full access to all features | Store owner |
| MANAGER | Create/edit products, manage inventory | Warehouse manager |
| STAFF | Read access to products, view inventory | Cashier |

**Permission Matrix**:

| Feature | ADMIN | MANAGER | STAFF |
|---------|-------|---------|-------|
| User Management | ✅ | ❌ | ❌ |
| Product Management | ✅ | ✅ | ❌ |
| Category Management | ✅ | ✅ | ❌ |
| Supplier Management | ✅ | ✅ | ❌ |
| Inventory Management | ✅ | ✅ | ❌ |
| Order Management | ✅ | ✅ | ✅ (read-only) |
| System Settings | ✅ | ❌ | ❌ |

**Implementation**:
```java
// Security configuration
@Bean
public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
    return http
        .csrf(csrf -> csrf.disable())  // Stateless API
        .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
        .authorizeHttpRequests(auth -> auth
            .requestMatchers("/api/auth/**").permitAll()
            .requestMatchers("/api/admin/**").hasRole("ADMIN")
            .requestMatchers("/api/managers/**").hasAnyRole("ADMIN", "MANAGER")
            .requestMatchers("/api/**").authenticated()
        )
        .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
        .build();
}
```

---

## Performance Architecture

### Database Performance

**Optimization Techniques**:

1. **Connection Pooling**:
   - HikariCP with 10 max connections
   - Min idle: 5 connections
   - Max lifetime: 30 minutes
   - Connection timeout: 30 seconds

2. **Query Optimization**:
   - Proper indexing (see Indexing Strategy above)
   - Avoid `SELECT *`, select only needed columns
   - Use `LIMIT` and `OFFSET` for pagination
   - Use `EXPLAIN` to analyze queries

3. **Lazy Loading**:
   - Use `FetchType.LAZY` for relationships
   - Avoid N+1 query problems
   - Use `@EntityGraph` when needed

**Query Examples**:
```sql
-- ✅ CORRECT: Optimized query with proper indexing
SELECT id, name, selling_price
FROM products
WHERE account_id = 123
  AND status = 'ACTIVE'
ORDER BY name ASC
LIMIT 20 OFFSET 0;

-- ❌ WRONG: Missing indexes
SELECT * FROM products
WHERE account_id = 123;
-- No index on account_id → Full table scan
```

### Application Performance

**Optimization Techniques**:

1. **Caching**:
   - Redis cache for frequently accessed data
   - Cache-aside pattern
   - Cache invalidation on data changes
   - Appropriate TTL values

2. **DTO Conversion**:
   - Convert entities to DTOs before API response
   - Hide internal fields (accountId, createdAt, etc.)
   - Use MapStruct or manual conversion

3. **Pagination**:
   - Page size: 20 items per page
   - Efficient pagination with OFFSET/LIMIT
   - Total count for pagination UI

4. **Batch Operations**:
   - Batch inserts for bulk operations
   - Avoid individual inserts in loops

**Performance Targets**:
- Page load time: <2 seconds (95th percentile)
- Search response: <500ms (95th percentile)
- API response time: <200ms (average)
- Database query time: <100ms (average)
- Cache hit rate: >80%

---

## Scalability Architecture

### Current Scale (MVP)

**Single Database Instance**:
- MySQL 8.0
- Row-level security via application logic
- Account-based data partitioning
- No database sharding

**Redis for Caching**:
- Session storage
- Product, category, supplier caching
- Search result caching
- No sharding needed for MVP

### Scalability Considerations

**Post-MVP Enhancements**:

1. **Database Sharding** (Future):
   - Account-based partitioning
   - Each account in separate shard
   - Horizontal scaling for multiple tenants
   - Requires migration to sharding strategy

2. **Elasticsearch** (Future):
   - When search becomes slow (>500ms)
   - For product catalogs >10,000 items
   - Advanced search features (fuzzy, autocomplete)
   - Vietnamese language analyzer

3. **CDN Integration** (Future):
   - Static assets (CSS, JS, images)
   - Image hosting (S3 + CloudFront)
   - Reduced load on application server

4. **Microservices** (Future):
   - Split into domain services:
     - User Service
     - Product Service
     - Inventory Service
     - Order Service
   - API Gateway for centralized routing
   - Event-driven architecture (Kafka/RabbitMQ)

5. **Load Balancing** (Future):
   - Multiple application instances
   - Horizontal scaling
   - Round-robin or weighted distribution
   - Health checks and auto-scaling

---

## Security Architecture

### Authentication Security

**Password Security**:
- BCrypt hashing with salt
- 12 rounds (cost factor)
- Separate password hash and salt tables
- Failed login attempt tracking (future)

**Token Security**:
- JWT with HS256 signature
- Short access token (15 min)
- Long refresh token (7 days)
- Refresh token rotation
- Secure cookie settings:
  - `HttpOnly`: Prevents JavaScript access
  - `Secure`: HTTPS only (production)
  - `SameSite=Strict`: CSRF protection
  - `Path=/`: Accessible on all routes

**Session Management**:
- No server-side sessions (stateless)
- JWT tokens in client cookies
- Refresh token rotation for security
- Automatic token refresh
- Device-specific session tracking

### Data Security

**SQL Injection Prevention**:
- Parameterized queries (JPA/Hibernate)
- No string concatenation in queries
- Prepared statements
- Hibernate parameter binding

**XSS Protection**:
- Output encoding in frontend
- Content Security Policy headers
- Input validation on backend
- Sanitize user input

**CSRF Protection**:
- Disabled for stateless APIs (JWT-based)
- Enabled for form submissions (Web)
- SameSite=Strict cookies
- CSRF tokens for web forms

### Data Privacy

**Account Isolation**:
- Row-level security enforced at all layers
- account_id in every table
- Queries filter by account_id
- Account access validation before operations

**Audit Trail**:
- Transaction history for inventory changes
- User tracking (created_by, updated_by)
- Timestamps for all changes
- Complete history preserved

**Data Protection**:
- Passwords hashed and stored separately
- No sensitive data in logs
- HTTPS-only communication (production)
- Secure cookie flags

---

## Error Handling Architecture

### Exception Hierarchy

```
Exception
  └── RuntimeException
      └── BaseException
          ├── BadRequestException (400)
          ├── UnauthorizedException (401)
          ├── ForbiddenException (403)
          ├── NotFoundException (404)
          ├── ConflictException (409)
          └── ServerException (500)
```

### Global Exception Handler

**Unified Error Response**:
```java
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BaseException.class)
    public ResponseEntity<ErrorResponse> handleBaseException(BaseException ex) {
        ErrorResponse error = ErrorResponse.builder()
            .code(ex.getCode())
            .message(ex.getMessage())
            .timestamp(new Date())
            .path(request.getRequestURI())
            .build();

        return ResponseEntity.status(ex.getCode()).body(error);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(...) {
        List<ValidationError> errors = extractValidationErrors(ex);
        ErrorResponse error = ErrorResponse.builder()
            .code(400)
            .message("Validation failed")
            .details(errors)
            .timestamp(new Date())
            .path(request.getRequestURI())
            .build();

        return ResponseEntity.badRequest().body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex) {
        ErrorResponse error = ErrorResponse.builder()
            .code(500)
            .message("Internal server error")
            .timestamp(new Date())
            .path(request.getRequestURI())
            .build();

        log.error("Unexpected error: ", ex);
        return ResponseEntity.internalServerError().body(error);
    }
}
```

### Error Response Format

```json
{
  "code": 400,
  "message": "Validation failed",
  "details": [
    {
      "field": "email",
      "message": "Email format is invalid"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters"
    }
  ],
  "timestamp": "2026-02-06T08:30:00Z",
  "path": "/api/products"
}
```

---

## Deployment Architecture

### Environment Configuration

**Development**:
- Database: Local MySQL (Docker)
- Cache: Local Redis (Docker)
- Logging: DEBUG level
- No SSL (localhost only)

**Staging**:
- Database: Staging MySQL
- Cache: Staging Redis
- Logging: INFO level
- HTTPS with self-signed certificate

**Production**:
- Database: Production MySQL (managed service)
- Cache: Production Redis (managed service)
- Logging: WARN level
- HTTPS with valid certificate
- Monitoring and alerting

### Build & Deployment

**Build Process**:
1. Clean and compile code: `./mvnw clean compile`
2. Run tests: `./mvnw test`
3. Package as JAR: `./mvnw clean package`
4. Create Docker image (future)

**Deployment Process**:
1. Build Docker image (future)
2. Push to container registry
3. Deploy to server
4. Run database migrations
5. Start application
6. Verify health checks

### Monitoring & Logging

**Logging Strategy**:
- Use SLF4J with Logback
- Log levels: ERROR, WARN, INFO, DEBUG
- Structured logging (JSON format)
- Log rotation: daily, keep 30 days

**Key Metrics to Monitor**:
- Request rate (requests/second)
- Response times (average, 95th percentile)
- Error rate (%)
- Database connection pool usage
- Redis cache hit rate
- JVM memory usage
- CPU usage

**Health Checks**:
- `/actuator/health` - Application health
- `/actuator/metrics` - Performance metrics
- `/health` - Simple health check endpoint

---

## Future Architecture Enhancements

### Phase 1: Feature Expansion (Months 2-3)

**Microservices Transition**:
- Split into domain services
- API Gateway for centralized routing
- Event-driven architecture (Kafka)
- Service discovery

**Database Sharding**:
- Account-based partitioning
- Horizontal scaling
- Dedicated shards per tenant

### Phase 2: Advanced Features (Months 4-6)

**Elasticsearch Integration**:
- Product search optimization
- Vietnamese language analyzer
- Advanced search features
- Fuzzy matching and autocomplete

**Cloud Deployment**:
- AWS/GCP deployment
- Managed MySQL (RDS/Cloud SQL)
- Managed Redis (ElastiCache/Memorystore)
- CDN for static assets

### Phase 3: Enterprise Features (Months 7-12)

**Multi-Store Management**:
- Store-level inventory
- Inter-store transfers
- Store-specific pricing
- Consolidated reporting

**POS Integration**:
- Sales transaction processing
- Receipt generation
- Payment gateway integration
- Customer management

**Advanced Analytics**:
- Sales forecasting
- Inventory optimization
- Customer behavior analysis
- Market trend insights

---

**Document Status**: Active
**Last Updated**: February 6, 2026
**Next Review**: After each major architectural change
**Maintained By**: Technical Documentation Specialist
