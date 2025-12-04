# Kiotviet MVP Technical Presentation

## Slide 1: Title Slide

# Kiotviet MVP
### A Multi-Tenant Product Management System
**Target Audience:** Large Retail Sellers
**Tech Stack:** Java 17, Spring Boot 3.5.7, MySQL, Redis

---

## Slide 2: Project Overview

### What is Kiotviet MVP?
A comprehensive, high-performance product management system designed for retail chains with multiple store locations.

*   **Core Goal:** Empower large retailers to manage 1,000+ products seamlessly.
*   **Key Constraint:** Strict multi-tenant isolation (data security).
*   **Timeline:** 6-week intensive development (Nov-Dec 2025).

---

## Slide 3: Technical Architecture

### The "Hexagonal" Approach
We follow a strict **Domain-First** architecture to ensure scalability and maintainability.

*   **Core Layer (`src/main/java/fa/academy/kiotviet/core/`)**
    *   Contains business logic and domain entities.
    *   Isolated from framework dependencies where possible.
    *   Modules: `productcatalog`, `usermanagement`, `inventory`, `orders`.
*   **Application Layer (`src/main/java/fa/academy/kiotviet/application/`)**
    *   Orchestrates user interactions.
    *   Controllers (API & Web), DTOs.
*   **Infrastructure Layer**
    *   Handles persistence (JPA Repositories), Security, and External APIs.

---

## Slide 4: Multi-Tenancy Strategy

### "Row-Level Isolation"
Instead of separate databases (too costly for MVP), we use a shared schema with strict row-level filtering.

*   **The `Company` Entity:** Acts as the tenant root.
*   **Implementation:**
    *   Every sensitive entity (`Product`, `Order`, `User`) has a `company_id` column.
    *   **Repository Layer Enforcement:**
        *   `findByIdAndCompany_Id(id, companyId)`
        *   `@Query("... WHERE p.company.id = :companyId ...")`
    *   **Security:** Middleware injects the authenticated user's `companyId` into every request context.

---

## Slide 5: Concurrency Control

### Solving the "Double Sell" Problem
What happens when two cashiers sell the last item at the exact same second?

*   **The Risk:** Negative inventory (overselling).
*   **The Solution:** **Pessimistic Locking**.
    *   We use `SELECT ... FOR UPDATE` via JPA's `@Lock(LockModeType.PESSIMISTIC_WRITE)`.
    *   **Code Evidence:** `ProductRepository.findWithLockByIdAndCompany_Id`
    *   **Flow:** Transaction starts -> Lock Row -> Check Stock -> Update -> Commit -> Release Lock.

---

## Slide 6: Search & Performance

### Finding Products Fast (<500ms)

*   **Strategy 1: Database Indexing**
    *   Composite indexes on `(company_id, status)` and `(company_id, sku)`.
*   **Strategy 2: Full-Text Search**
    *   Native MySQL `FULLTEXT` index on product names.
    *   Enables natural language search (e.g., matching "Phone Samsung" to "Samsung Smart Phone").
*   **Strategy 3: Caching (Redis)**
    *   Cache frequently accessed data like Category Trees and User Sessions.

---

## Slide 7: Security & Authentication

### JWT-Based Stateless Auth

*   **Access Tokens:** Short-lived (15 mins) for API access.
*   **Refresh Tokens:** Long-lived (7 days) stored securely in HttpOnly cookies + Redis.
*   **Authorization:** Role-Based Access Control (RBAC) - Admin, Manager, Staff.
*   **Protection:** BCrypt password hashing + Salt.

---

## Slide 8: Current Status & Roadmap

### Where We Are (Week 1/6)
*   ✅ **Completed:** Project Setup, Database Schema, Auth Foundation.
*   🚧 **In Progress:** Product CRUD, Multi-tenant enforcement.
*   📋 **Next Steps:**
    *   **Week 2:** Category & Supplier Management.
    *   **Week 3:** Product Logic & Image Uploads.
    *   **Week 4:** Inventory Transactions.

---

## Slide 9: Q&A

### Open for Discussion
*   *Specific implementation details?*
*   *Deployment strategy?*
*   *Future scaling plans (Elasticsearch, Microservices)?*
