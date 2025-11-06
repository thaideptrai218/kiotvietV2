# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Kiotviet-style multi-tenant product management system for large retail sellers in Vietnam. Built with Spring Boot 3.5.7 and Java 17, designed to handle 1000+ products per account with high-concurrency requirements. The system features hierarchical categories, supplier management, real-time inventory tracking, and scalable search capabilities.

### Project Status

-   **Current Phase**: MVP Implementation (Week 1 of 6)
-   **Progress**: Database schema simplified and documented for MVP
-   **Timeline**: November 5 - December 17, 2025
-   **Target**: Production-ready MVP for pilot testing
-   **Latest Update**: MVP database schema simplifications completed (2025-11-05)

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

### Maven Wrapper

-   Use `./mvnw` (Linux/Mac) or `mvnw.cmd` (Windows) instead of `mvn` to ensure consistent Maven version

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

### Project Structure (Updated - Enterprise Architecture)

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
│   │   │   │   └── WebConfig.java      # Web MVC and CORS configuration
│   │   │   ├── application/             # Application layer
│   │   │   │   ├── controller/          # REST API controllers
│   │   │   │   ├── dto/                 # Data transfer objects
│   │   │   │   └── facade/              # Complex business operations
│   │   │   ├── core/                    # Domain layer
│   │   │   │   ├── domain/              # Business entities organized by domain
│   │   │   │   │   ├── usermanagement/  # User, Permission entities
│   │   │   │   │   ├── tenant/           # Multi-tenant Account entity
│   │   │   │   │   ├── productcatalog/  # Product, Category entities
│   │   │   │   │   ├── inventory/       # Inventory entities
│   │   │   │   │   ├── orders/          # Order entities
│   │   │   │   │   ├── suppliers/       # Supplier entities
│   │   │   │   │   └── analytics/       # Analytics entities
│   │   │   │   ├── service/             # Business services
│   │   │   │   └── repository/          # JPA data access interfaces
│   │   │   ├── infrastructure/          # Infrastructure layer
│   │   │   │   ├── security/            # JWT, authentication, authorization
│   │   │   │   │   ├── JwtAuthenticationFilter.java
│   │   │   │   │   └── service/         # Security services
│   │   │   │   ├── persistence/         # JPA implementations
│   │   │   │   └── external/            # Third-party integrations
│   │   │   ├── shared/                 # Shared utilities
│   │   │   │   └── BaseEntity.java     # Common entity functionality
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

### Testing

-   Test classes mirror main package structure
-   Use Spring Boot Test framework with JUnit
-   Located in `src/test/java/fa/academy/kiotviet/`
-   Organized by test type: unit/, integration/, e2e/
-   Multi-tenant testing with isolated test data

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

-   **Backend Developers**: Work in `core/service/`, `application/controller/`, `infrastructure/`
-   **Security Specialists**: Work in `infrastructure/security/`, `config/`
-   **Database Architects**: Work in `core/domain/`, `infrastructure/persistence/`
-   **Frontend Developers**: Work in `static/`, `templates/` with module-based approach
-   **QA Engineers**: Work in `test/` with comprehensive test structure
-   **DevOps Engineers**: Work in `scripts/`, `docker/`, `ci-cd/`, `monitoring/`
-   No artifacts.

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
