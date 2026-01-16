# 🏪 Kiotviet MVP - Multi-tenant Product Management System

![Java](https://img.shields.io/badge/Java-21-ED8B00?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.5.7-6DB33F?style=for-the-badge&logo=spring-boot&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7.0-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen?style=for-the-badge)

A comprehensive product management system for large retail sellers in Vietnam, built with **Spring Boot 3.5.7** and **Java 21**. GOOD

---

## 📑 Table of Contents

-   [Project Overview](#-project-overview)
-   [Technology Stack](#-technology-stack)
-   [Quick Start](#-quick-start)
-   [Project Structure](#-project-structure)
-   [Development Commands](#-development-commands)
-   [Database Schema](#-database-schema)
-   [API Documentation](#-api-documentation)
-   [Performance Targets](#-performance-targets)
-   [Security Features](#-security-features)
-   [Testing](#-testing)
-   [CI/CD Pipeline](#-cicd-pipeline)
-   [Documentation](#-documentation)
-   [License](#-license)

---

## 🔭 Project Overview

**Target**: Large retail sellers with multiple store locations  
**Architecture**: Multi-tenant SaaS with account-based isolation  
**Scale**: 1000+ products per account, 100+ concurrent users per tenant  
**Timeline**: November 5 - December 17, 2025 (6 weeks)

### Core Features

-   🔐 **Multi-tenant User Management**: Secure authentication with JWT tokens
-   📦 **Product Catalog**: Barcode search, hierarchical categories, supplier management
-   📊 **Inventory Management**: Real-time tracking with concurrency control
-   🔍 **High-Performance Search**: Optimized product search with filters
-   🏗️ **Scalable Architecture**: MySQL + Redis + Elasticsearch stack

---

## 🛠️ Technology Stack

-   **Backend**: Spring Boot 3.5.7, Java 21, Flyway for database migrations, Apache POI for Excel operations
-   **Database**: MySQL 8.0+ with multi-tenant isolation
-   **Caching**: Redis for performance optimization
-   **Authentication**: JWT with refresh tokens
-   **Frontend**: Thymeleaf templates, Bootstrap, JavaScript
-   **Build**: Maven with wrapper, Docker Compose for local development
-   **Testing**: JUnit 5, Spring Boot Test

---

## 🚀 Quick Start

### Prerequisites

-   Java 21+
-   Maven 3.8+
-   Docker & Docker Compose (for local database and Redis)
-   Git

### Installation

1. **Clone the repository**

    ```bash
    git clone <repository-url>
    cd kiotviet
    ```

2. **Start MySQL and Redis using Docker Compose**

    ```bash
    docker compose up -d
    ```

    _This will start MySQL on port 33006 and Redis on 6379._

3. **Run database migrations with Flyway**

    ```bash
    ./mvnw flyway:migrate
    ```

    _The application properties (e.g., `spring.datasource.url`) are pre-configured to connect to the Dockerized services._

4. **Build and run**

    ```bash
    ./mvnw clean install
    ./mvnw spring-boot:run
    ```

5. **Access the application**
    - URL: http://localhost:8080
    - Default admin: Create through registration

---

## 🏗️ Project Structure

This project follows a **Domain-First Enterprise Architecture**, organizing code by business domain rather than technical layers.

```plaintext
src/
├── main/
│   ├── java/fa/academy/kiotviet/       # Root package
│   │   ├── application/                # Application layer (Controllers, DTOs, Application Services)
│   │   ├── core/                       # Domain layer (Entities, Domain Services, Repositories grouped by feature)
│   │   │   ├── usermanagement/
│   │   │   ├── productcatalog/
│   │   │   └── ...
│   │   ├── infrastructure/             # Infrastructure layer (Security, Persistence implementations)
│   │   └── config/                     # Spring Configuration
│   └── resources/
│       ├── templates/                  # Thymeleaf templates
│       ├── static/                     # CSS, JS, images
│       └── application.yml             # Main configuration
└── test/                               # Test code (unit, integration, e2e)
```

---

## 💻 Development Commands

-   **Build**: `./mvnw clean compile`
-   **Run**: `./mvnw spring-boot:run`
-   **Package**: `./mvnw clean package`
-   **Test**: `./mvnw test`
-   **Test specific**: `./mvnw test -Dtest=ClassName`

---

## 🗄️ Database Schema

### Core Tables

-   **accounts**: Tenant information
-   **user_info**: User profiles
-   **user_auth**: Authentication credentials
-   **user_tokens**: JWT token management
-   **categories**: Hierarchical product categories
-   **suppliers**: Supplier information
-   **products**: Product catalog
-   **product_images**: Product image storage
-   **inventory**: Stock tracking
-   **inventory_transactions**: Audit trail

---

## 📡 API Documentation

### Authentication

-   `POST /api/auth/register` - User registration
-   `POST /api/auth/login` - User login
-   `POST /api/auth/refresh` - Token refresh
-   `POST /api/auth/logout` - User logout

### Products

-   `GET /api/products` - List products with pagination
-   `POST /api/products` - Create product
-   `GET /api/products/{id}` - Get product details
-   `PUT /api/products/{id}` - Update product
-   `DELETE /api/products/{id}` - Delete product

### Categories

-   `GET /api/categories` - Get category tree
-   `POST /api/categories` - Create category
-   `PUT /api/categories/{id}` - Update category
-   `DELETE /api/categories/{id}` - Delete category

### Suppliers

-   `GET /api/suppliers` - List suppliers
-   `POST /api/suppliers` - Create supplier
-   `PUT /api/suppliers/{id}` - Update supplier
-   `DELETE /api/suppliers/{id}` - Delete supplier

### Inventory

-   `GET /api/inventory` - Get inventory overview
-   `POST /api/inventory/adjust` - Manual stock adjustment
-   `GET /api/inventory/transactions` - Transaction history

---

## ⚡ Performance Targets

-   **Page load time**: <2 seconds (95th percentile)
-   **Search response**: <500ms (95th percentile)
-   **Concurrent users**: 100+ per tenant
-   **Database queries**: <100ms average
-   **Cache hit rate**: >80% for cached entities

---

## 🔒 Security Features

-   Multi-tenant data isolation with `account_id` filtering
-   JWT authentication with refresh token rotation
-   BCrypt password hashing
-   Protection against SQL injection, XSS, CSRF
-   Audit trail for all inventory changes

---

## 🧪 Testing

-   **Unit tests**: Service layer business logic
-   **Integration tests**: Repository and API endpoints
-   **Security tests**: Authentication and authorization
-   **Performance tests**: Load testing with JMeter
-   **Target coverage**: 80%+

---

## 🤖 CI/CD Pipeline

This project uses GitHub Actions for Continuous Integration and Continuous Deployment (CI/CD) with self-hosted runners.

-   **Workflow File**: `.github/workflows/self-hosted-cicd.yml`
-   **Trigger**: Automatically builds and deploys on pushes to `main` or `master` branches.
-   **Steps**:
    1.  Checkout code.
    2.  Set up JDK 21.
    3.  Build with Maven (skipping tests).
    4.  Restart the application on the self-hosted runner.

---

## 📚 Documentation

For detailed project documentation, see the `docs/` directory:

#### Development & Setup

-   **[Database Workflow](docs/database-workflow.md)** - Complete database development guide
-   **[Database Reset Guide](docs/database-reset-guide.md)** - Manual database reset instructions
-   **[Progress Tracker](docs/plan-progress.md)** - Implementation progress and milestones

#### Architecture & Design

-   **[Technical Specification](docs/kiotviet-tech-spec.md)** - Detailed technical requirements
-   **[Architectural Strategy](docs/KIOTVIET_MVP_ARCHITECTURAL_STRATEGY.md)** - System architecture decisions
-   **[Working Rules](docs/CLAUDE_RULES.md)** - Project development guidelines

#### API & Plans

-   **[API Documentation](docs/api/)** - REST API documentation (coming soon)
-   **[Implementation Plans](docs/plans/)** - Detailed implementation plans (coming soon)
-   **[Design Documents](docs/design/)** - System design documents (coming soon)

---

## 📜 License

Private project for FA Training purposes.

## 📞 Support

For project questions and support, refer to:

-   Project documentation in `/docs` directory
-   Issue tracking in project management system
-   Technical lead for architectural decisions
