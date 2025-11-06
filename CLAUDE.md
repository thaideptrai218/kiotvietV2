# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Kiotviet-style multi-tenant product management system for large retail sellers in Vietnam. Built with Spring Boot 3.5.7 and Java 17, designed to handle 1000+ products per account with high-concurrency requirements. The system features hierarchical categories, supplier management, real-time inventory tracking, and scalable search capabilities.

### Project Status
- **Current Phase**: MVP Implementation (Week 1 of 6)
- **Progress**: Database schema simplified and documented for MVP
- **Timeline**: November 5 - December 17, 2025
- **Target**: Production-ready MVP for pilot testing
- **Latest Update**: MVP database schema simplifications completed (2025-11-05)

### Business Model & Scale
- **Target**: Large retail sellers with multiple store locations
- **Multi-tenant**: Account-based isolation with high-security requirements
- **Scale**: 1000+ products per account, 100+ concurrent users per tenant
- **Performance**: <500ms product search (MVP target), <2s page load
- **Architecture**: MySQL + Redis stack for MVP, Elasticsearch post-MVP

### Core Requirements (MVP Simplified)
- Multi-tenant user management with 2FA support (4-table design: accounts, user_info, user_auth, user_tokens)
- Product catalog with barcode search and multiple image support
- Hierarchical categories with path-based storage (`/electronics/mobile/phones`)
- Supplier management (basic contact information only for MVP)
- Real-time inventory tracking with manual stock adjustments
- High-performance search using MySQL FULLTEXT (MVP), Elasticsearch post-MVP

### Progress Tracking
- **Implementation Plan**: `/home/welterial/kiotviet/plan-progress.md`
- **Technical Specification**: `/home/welterial/kiotviet/docs/kiotviet-tech-spec.md` (UPDATED)
- **Architectural Strategy**: `/home/welterial/kiotviet/KIOTVIET_MVP_ARCHITECTURAL_STRATEGY.md`
- **Database Migrations**: `/home/welterial/kiotviet/src/main/resources/db/migration/` (SIMPLIFIED)

### Critical Architecture Decisions (MVP Focus)

#### Database & Storage (MVP Simplified)
- **Primary**: MySQL with account_id multi-tenant isolation
- **Caching**: Redis for product catalog, categories, search results
- **Search**: MySQL FULLTEXT for MVP (<1000 products), Elasticsearch migration post-MVP
- **Images**: Local filesystem storage (`/uploads/products/{accountId}/{productId}/`)
- **MVP Tables**: accounts, user_info, user_auth, user_tokens, categories, suppliers, products, product_images, inventory, inventory_transactions
- **Commented Out**: audit_logs, stock_adjustments, low_stock_alerts (add post-MVP)

#### Performance & Concurrency (MVP Targets)
- **Locking Strategy**: Pessimistic locking (SELECT FOR UPDATE) for inventory + optimistic locking (JPA @Version)
- **Caching Strategy**: Cache-aside pattern with automatic invalidation on updates
- **Indexing**: Essential MVP indexes on (account_id, business_key) combinations
- **Response Targets**: <500ms product search, <200ms API average, <2s page load

#### Security & Multi-Tenancy (MVP Implementation)
- **Tenant Isolation**: JPA-level automatic account_id filtering
- **Security Layer**: JWT authentication with refresh tokens (15min access, 7day refresh)
- **Two-Factor Auth**: Enabled for MVP (user preference)
- **Permissions**: Simple role-based (admin/manager/staff) for MVP, JSON permissions post-MVP
- **Data Consistency**: Manual cache invalidation, event-driven post-MVP

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

### Project Structure (Updated)

```
kiotviet/
├── docs/                               # Documentation
│   └── kiotviet-tech-spec.md           # Complete technical specification
├── src/
│   ├── main/
│   │   ├── java/fa/training/kiotviet/ # Main application code
│   │   │   ├── config/                  # Security, Redis, Web MVC config
│   │   │   ├── controller/              # REST API endpoints
│   │   │   ├── service/                 # Business logic layer
│   │   │   ├── repository/              # JPA data access
│   │   │   ├── entity/                  # Database entities
│   │   │   └── dto/                     # Data transfer objects
│   │   └── resources/
│   │       ├── db/migration/            # Flyway database migrations (MVP simplified)
│   │       ├── static/                  # CSS, JS, images
│   │       ├── templates/               # HTML pages (login, dashboard)
│   │       └── uploads/                 # User-uploaded product images
│   └── test/                           # Unit, integration, and E2E tests
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

-   Package structure follows Maven conventions: `fa.training.kiotviet`
-   Lombok is configured for annotation processing
-   Use Spring Boot's component scanning (@Component, @Service, @Repository, @Controller)

### Testing

-   Test classes mirror main package structure
-   Use Spring Boot Test framework with JUnit
-   Located in `src/test/java/fa/training/kiotviet/`

### Development Tools

-   Spring Boot DevTools enables automatic restart on code changes
-   Maven compiler plugin configured with Lombok annotation processor
-   Spring Boot Maven plugin for executable JAR creation
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
- when complate a task please go to @plan-progress.md and tick for completion