# Mock Project Presentation Content

This document contains the structured content for your group presentation. Use this to fill in your PowerPoint slides.

---

## Slide 1: Introduction to Mock Project

**Project Name:** Kiotviet MVP (Multi-tenant Product Management System)

**Why we chose this title:**
We chose "Kiotviet MVP" because we wanted to replicate the core functionality of Kiotviet, a leading retail management software in Vietnam. "MVP" (Minimum Viable Product) signifies our focus on delivering the most critical features first.

**Real-world Application:**
*   **Can it be used in the real world?** Yes.
*   **Why?**
    *   **Essential Features:** It handles the core needs of any retail business: tracking products, managing stock, and processing sales.
    *   **Multi-tenancy:** The system is designed to support multiple store owners (tenants) securely on a single platform, making it cost-effective.
    *   **Scalability:** Built with industry-standard technologies (Java Spring Boot, MySQL, Redis) that are robust and scalable.

---

## Slide 2: Team Introduction

*(Action: Add photos of all members here. Do not use avatars.)*

**Team Responsibilities:**

*   **[Member Name 1]**
    *   **Role:** Project Lead / Backend Developer
    *   **Tasks:** Project setup, Architecture design, Authentication & Security (JWT), User Management.
*   **[Member Name 2]**
    *   **Role:** Full Stack Developer
    *   **Tasks:** Product Catalog (CRUD), Image Uploads, Search functionality.
*   **[Member Name 3]**
    *   **Role:** Frontend Lead / Database Designer
    *   **Tasks:** UI/UX Design (Thymeleaf/Bootstrap), Category & Supplier modules.
*   **[Member Name 4]**
    *   **Role:** Backend Developer / QA
    *   **Tasks:** Inventory Management, Order Processing, Testing & Bug fixing.

*(Action: Add photos of members discussing/meeting)*

---

## Slide 3: Software Used

*   **IntelliJ IDEA / VS Code:** Primary Integrated Development Environments (IDEs).
*   **Maven (3.9.x):** Dependency management.
*   **MySQL (8.0):** Relational database (ACID compliant).
*   **Redis (7.0):** Caching and session management.
*   **Docker & Docker Compose:** Containerization for consistent dev environments.
*   **Apache POI:** For Excel export/import operations.
*   **Git:** Version control.

---

## Slide 4: Frontend Requirements

**Technologies Used:**
*   **Thymeleaf:** Server-side Java template engine.
*   **Bootstrap 5.3:** CSS Framework for responsive design.
*   **Vanilla JavaScript (ES6+) & AJAX:**
    *   *Why:* Lightweight, no build step.
    *   *Architecture:* **Class-based Modules** (e.g., `KiotVietAuth`) for robust state management, mimicking React components without the overhead.

**Advantages:**
*   Fast initial page load (SSR).
*   Clean separation of concerns using JS modules.

**Disadvantages:**
*   Less dynamic than a full SPA.

---

## Slide 5: Backend Requirements

**Technologies Used:**
*   **Java 21 LTS:**
    *   *Why:* Latest LTS, using modern features like Records and Virtual Threads.
*   **Spring Boot 3.5.7:**
    *   *Why:* Rapid development, embedded server.
*   **Spring Security & JWT:**
    *   *Why:* Stateless, secure authentication.

**Advantages:**
*   Strong type safety.
*   **Virtual Threads** (Java 21) for high-concurrency handling.
*   Robust ecosystem.

**Disadvantages:**
*   Higher memory footprint than Node.js.

---

## Slide 6: Database Requirements

**Database:** MySQL 8.0

**Why we chose it:**
*   We need strict data integrity for financial transactions (Orders) and Inventory. MySQL provides robust Transaction support (ACID).

**Pros & Cons:**
*   *Pros:* Reliable, widely supported, strong consistency.
*   *Cons:* Horizontal scaling is harder compared to NoSQL.

*(Action: Insert Screenshot of your Database Schema/ER Diagram)*
*(Action: Insert Screenshot of a Table with data, e.g., `products` table)*
*(Action: Insert Screenshot showing a `UPDATE` or `DELETE` SQL query execution)*

---

## Slide 7: Jira Usage Requirements

**What is Jira?**
Jira is a project management tool used for issue tracking and agile project management.

**Why we use it:**
*   To track progress across the team.
*   To manage Sprints and backlogs.

**Pros & Cons:**
*   *Pros:* Excellent visibility, highly customizable workflows.
*   *Cons:* Can be complex to configure initially.

**Agile Structure:**
*   **Epic:** Large initiatives (e.g., "Product Management", "Authentication").
*   **Story:** User-centric requirements (e.g., "As a user, I want to upload product images").
*   **Sprint:** A time-boxed period (e.g., 1 week) to complete specific stories.

*(Action: Insert 3 Screenshots of Jira Reports for Sprint 1, 2, and 3)*
*(Action: Insert Screenshot of Jira Board/Backlog)*
*(Action: Insert Screenshot of Team Members list in Jira)*

---

## Slide 8: Sprint 1 - Foundation & Auth

**Focus:** Project Setup, Database Design, User Authentication.

**Workflows:**
1.  **Registration:** User submits details -> Backend creates Account & User -> Password Hashed (BCrypt) -> Saved to DB.
2.  **Login:** User submits credentials -> Backend validates -> Issues JWT Access & Refresh Tokens.
3.  **Project Structure:** Established Domain-First architecture (`core` vs `application` layers).

*(Action: Insert Screenshot of Sprint 1 Board/Burndown Chart)*

---

## Slide 9: Sprint 2 - Catalog Management

**Focus:** Categories and Suppliers.

**Workflows:**
1.  **Categories:** Implemented hierarchical category tree using materialized paths.
2.  **Suppliers:** CRUD operations for managing product sources.
3.  **Mini-Managers:** Built inline "Quick Create" modals for Brands and Categories within the Product form for better UX.

*(Action: Insert Screenshot of Sprint 2 Board/Burndown Chart)*

---

## Slide 10: Sprint 3 - Products & Inventory

**Focus:** Core Product Logic and Stock Management.

**Workflows:**
1.  **Product CRUD:** Creating products with images, prices, and SKUs.
2.  **Inventory Control:** Implemented **Pessimistic Locking** to prevent overselling.
3.  **Purchase Reception:** Handling "Partial" and "Full" receipt of goods to increase stock.
4.  **Stock Count:** Reconciliation feature to adjust system stock based on physical counts.

*(Action: Insert Screenshot of Sprint 3 Board/Burndown Chart)*

---

## Slide 11: Git Requirement

**What is Git?**
A distributed version control system.

**Why use it?**
To collaborate on code without overwriting each other's work and to keep a history of changes.

**Pros & Cons:**
*   *Pros:* Branching/Merging is powerful, distributed safety.
*   *Cons:* Learning curve for merge conflicts.

*(Action: Insert Screenshot of GitHub Repository/Commit History)*
*(Action: Insert Screenshot of "Contributors" or "Access" settings page)*

---

## Slide 12: Project Key Points

**Configuration:**
*   **`pom.xml`:** Manages dependencies like `spring-boot-starter-web`, `lombok`, `jjwt`.
*   **`application.yml`:** Configures Database URL, Redis host, and JWT secrets.

**Structure:**
*   **Package Explorer:** We follow a **Domain-Driven Design**:
    *   `fa.academy.kiotviet.core`: Contains business logic (Entities, Repositories).
    *   `fa.academy.kiotviet.application`: Contains Controllers and DTOs.
*   **Frontend Pattern:** **State-based Vanilla JS**. We use a global `state` object in JavaScript to manage UI state (pagination, filters) without external frameworks.

**Database:**
*   **Tables Used:** ~12 core tables (products, orders, users, categories, etc.).
*   **Migrations:** Managed via Flyway (V1 to V15).

*(Action: Insert Screenshot of Project Package Structure in IDE)*
*(Action: Insert Screenshot of `pom.xml` dependencies)*

---

## Slide 13: Testing

**What is testing?**
Verifying that our code behaves as expected to prevent regressions.

**Our Testing Strategy:**
*   **Unit Tests:** Testing individual service logic (isolated).
*   **Integration Tests:** Testing API endpoints with real DB/Redis contexts.
*   **E2E Tests:** End-to-End testing structure prepared for full user flow validation.

*(Action: Insert Screenshot of JUnit Test Results)*
*(Action: Insert Screenshot of Test Directory Structure)*

---

## Slide 14: Project Deliverables

*   [x] **Source Code:** `Group_[No]_Kiotviet_MVP`
*   [x] **SQL Script:** Database migration scripts included.
*   [x] **PowerPoint:** This presentation.
*   [x] **Demo:** Ready for 30-minute presentation and Q&A.

---

## Slide 15: Future Plan

**Upgrades:**
1.  **POS Integration:** Connect with barcode scanners and receipt printers.
2.  **Mobile App:** Build a Flutter app for shop owners to track sales on the go.
3.  **Advanced Search:** Migrate from MySQL Full-Text to **Elasticsearch** for fuzzy matching and faster results.
4.  **Microservices:** Split the Monolith into `Auth`, `Product`, and `Order` services as traffic grows.

---

## Slide 16: Summarize

**Project Feedback:**
*   The "Domain-First" architecture made the code organized but was harder to set up initially.
*   Multi-tenancy added complexity but provided valuable security learning.

**Team Feedback:**
*   [Member 1] handled complex Auth logic well.
*   [Member 3] created a very clean UI.
*   Communication was key during the Git merge conflicts in Sprint 2.

*(Action: Add specific personal feedback)*
