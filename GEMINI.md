# Kiotviet MVP - Gemini Context

This file provides essential context and instructions for working on the Kiotviet MVP project.

## 1. Project Overview

**Kiotviet MVP** is a multi-tenant product management system designed for large retail sellers in Vietnam. It is built using Spring Boot 3.5.7 and Java 17, featuring a monolithic architecture with domain-driven design principles.

**Key Features:**
*   Multi-tenant user management (JWT authentication).
*   Product catalog with hierarchical categories and supplier management.
*   Real-time inventory tracking with optimistic locking.
*   Performance-optimized search (MySQL FULLTEXT).

**Technology Stack:**
*   **Backend:** Java 17, Spring Boot 3.5.7
*   **Database:** MySQL 8.0+ (Flyway for migrations)
*   **Caching:** Redis 7.0+
*   **Frontend:** Thymeleaf, Bootstrap 5.3, Vanilla JS (AJAX)
*   **Build:** Maven 3.9+

## 2. Building and Running

Use the Maven Wrapper (`./mvnw`) for all build operations to ensure consistency.

*   **Build & Compile:**
    ```bash
    ./mvnw clean compile
    ```
*   **Run Application:**
    ```bash
    ./mvnw spring-boot:run
    ```
    *The application runs on `http://localhost:8080`.*
*   **Run Tests:**
    ```bash
    ./mvnw test
    ```
*   **Package (JAR):**
    ```bash
    ./mvnw clean package
    ```
*   **Database Migrations:**
    ```bash
    ./mvnw flyway:migrate
    ./mvnw flyway:info
    ```

## 3. Development Conventions & Architecture

Adhere strictly to the following rules found in `CLAUDE.md` and `docs/CLAUDE_RULES.md`.

### coding Style
*   **Dependency Injection:** ALWAYS use constructor injection with Lombok's `@RequiredArgsConstructor`. **Avoid** `@Autowired` on fields.
    ```java
    @Service
    @RequiredArgsConstructor
    public class ProductService {
        private final ProductRepository productRepository; // Final field, injected via constructor
    }
    ```
*   **Package Structure:** Domain-first organization.
    *   `fa.academy.kiotviet.core.{domain}` (e.g., `productcatalog`, `inventory`)
    *   `fa.academy.kiotviet.application.controller`
    *   `fa.academy.kiotviet.application.dto`
*   **Multi-Tenancy:** All database entities and queries MUST filter by `account_id`. This is often handled in the Repository or Entity layer but must be verified.
*   **Response Handling:** Use `ResponseFactory` for standardized API responses.
*   **Frontend:**
    *   Thymeleaf templates located in `src/main/resources/templates`.
    *   Feature-specific components in `src/main/resources/templates/modules/{feature}`.
    *   Static assets (JS/CSS) in `src/main/resources/static`.

### Interaction Rules
*   **No Gratitude:** Do not say "Thanks", "Great catch", etc. Just state the fix.
*   **Show the Code:** Focus on the technical solution and implementation.
*   **Push Back:** If a user request introduces security risks, performance issues (N+1 queries), or technical debt, professionally challenge it and propose a better solution.

## 4. Project Structure

```
/home/welterial/haizz/kiotviet/
├── src/main/java/fa/academy/kiotviet/
│   ├── application/      # Controllers, DTOs, Services
│   ├── core/             # Domain entities and logic (Domain-First)
│   │   ├── tenant/
│   │   ├── productcatalog/
│   │   └── ...
│   ├── infrastructure/   # Security, Persistence
│   └── config/           # Spring Configuration
├── src/main/resources/
│   ├── application.yml   # Main configuration
│   ├── db/migration/     # Flyway SQL migrations
│   ├── templates/        # Thymeleaf views
│   └── static/           # CSS, JS, Images
├── docs/                 # Comprehensive documentation
│   ├── CLAUDE_RULES.md   # Critical coding rules
│   ├── kiotviet-tech-spec.md # Technical specifications
│   └── ...
└── pom.xml               # Maven dependencies
```

## 5. Critical Documentation

Refer to these files for deeper understanding:
*   **`CLAUDE.md` / `docs/CLAUDE_RULES.md`**: Mandatory coding and interaction guidelines.
*   **`docs/kiotviet-tech-spec.md`**: Detailed technical specifications and database schema.
*   **`docs/plan-progress.md`**: Current project status and todo list.
*   **`docs/KIOTVIET_MVP_ARCHITECTURAL_STRATEGY.md`**: Architectural decisions.

## 6. Configuration

*   **Database:** Configured in `src/main/resources/application.yml`. Default is `jdbc:mysql://localhost:33006/kiotviet_db` (User: `root`, Pass: `root1234`).
*   **Security:** JWT based. configuration in `application.yml` under `app.jwt`.
