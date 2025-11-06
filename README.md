# Kiotviet MVP - Multi-tenant Product Management System

A comprehensive product management system for large retail sellers in Vietnam, built with Spring Boot 3.5.7 and Java 17.

## Project Overview

**Target**: Large retail sellers with multiple store locations
**Architecture**: Multi-tenant SaaS with account-based isolation
**Scale**: 1000+ products per account, 100+ concurrent users per tenant
**Timeline**: November 5 - December 17, 2025 (6 weeks)

### Core Features

- **Multi-tenant User Management**: Secure authentication with JWT tokens
- **Product Catalog**: Barcode search, hierarchical categories, supplier management
- **Inventory Management**: Real-time tracking with concurrency control
- **High-Performance Search**: Optimized product search with filters
- **Scalable Architecture**: MySQL + Redis + Elasticsearch stack

## Technology Stack

- **Backend**: Spring Boot 3.5.7, Java 17
- **Database**: MySQL 8.0+ with multi-tenant isolation
- **Caching**: Redis for performance optimization
- **Authentication**: JWT with refresh tokens
- **Frontend**: Thymeleaf templates, Bootstrap, JavaScript
- **Build**: Maven with wrapper
- **Testing**: JUnit 5, Spring Boot Test

## Quick Start

### Prerequisites

- Java 17+
- Maven 3.8+
- MySQL 8.0+
- Redis 7.0+

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd kiotviet
   ```

2. **Configure database**
   ```bash
   mysql -u root -p
   CREATE DATABASE kiotviet_mvp;
   ```

3. **Configure application properties**
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/kiotviet_mvp
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   ```

4. **Build and run**
   ```bash
   ./mvnw clean install
   ./mvnw spring-boot:run
   ```

5. **Access the application**
   - URL: http://localhost:8080
   - Default admin: Create through registration

## Project Structure

```
src/
├── main/
│   ├── java/fa/training/kiotviet/
│   │   ├── controller/          # REST endpoints
│   │   ├── service/             # Business logic
│   │   ├── repository/          # Data access
│   │   ├── entity/              # JPA entities
│   │   ├── dto/                 # Data transfer objects
│   │   ├── config/              # Configuration
│   │   └── KiotvietApplication.java
│   └── resources/
│       ├── templates/           # Thymeleaf templates
│       ├── static/              # CSS, JS, images
│       └── application.properties
└── test/                        # Test code
```

## Development Commands

- **Build**: `./mvnw clean compile`
- **Run**: `./mvnw spring-boot:run`
- **Package**: `./mvnw clean package`
- **Test**: `./mvnw test`
- **Test specific**: `./mvnw test -Dtest=ClassName`

## Database Schema

### Core Tables

- **accounts**: Tenant information
- **user_info**: User profiles
- **user_auth**: Authentication credentials
- **user_tokens**: JWT token management
- **categories**: Hierarchical product categories
- **suppliers**: Supplier information
- **products**: Product catalog
- **product_images**: Product image storage
- **inventory**: Stock tracking
- **inventory_transactions**: Audit trail

## API Documentation

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Token refresh
- `POST /api/auth/logout` - User logout

### Products
- `GET /api/products` - List products with pagination
- `POST /api/products` - Create product
- `GET /api/products/{id}` - Get product details
- `PUT /api/products/{id}` - Update product
- `DELETE /api/products/{id}` - Delete product

### Categories
- `GET /api/categories` - Get category tree
- `POST /api/categories` - Create category
- `PUT /api/categories/{id}` - Update category
- `DELETE /api/categories/{id}` - Delete category

### Suppliers
- `GET /api/suppliers` - List suppliers
- `POST /api/suppliers` - Create supplier
- `PUT /api/suppliers/{id}` - Update supplier
- `DELETE /api/suppliers/{id}` - Delete supplier

### Inventory
- `GET /api/inventory` - Get inventory overview
- `POST /api/inventory/adjust` - Manual stock adjustment
- `GET /api/inventory/transactions` - Transaction history

## Performance Targets

- **Page load time**: <2 seconds (95th percentile)
- **Search response**: <500ms (95th percentile)
- **Concurrent users**: 100+ per tenant
- **Database queries**: <100ms average
- **Cache hit rate**: >80% for cached entities

## Security Features

- Multi-tenant data isolation with account_id filtering
- JWT authentication with refresh token rotation
- BCrypt password hashing
- Protection against SQL injection, XSS, CSRF
- Audit trail for all inventory changes

## Testing

- **Unit tests**: Service layer business logic
- **Integration tests**: Repository and API endpoints
- **Security tests**: Authentication and authorization
- **Performance tests**: Load testing with JMeter
- **Target coverage**: 80%+

## Contributing

1. Follow the coding standards defined in `docs/CLAUDE_RULES.md`
2. Update `docs/plan-progress.md` after completing tasks
3. Ensure all tests pass before submitting
4. Document API changes
5. Follow multi-tenant patterns for data access

## Progress Tracking

Current implementation progress is tracked in `docs/plan-progress.md`:
- **Overall**: 8% complete (13/168 tasks)
- **Current Week**: Week 1 - Project Setup & Foundation (48% complete)
- **Next Milestone**: Complete authentication system

## Documentation

### 📚 Project Documentation
For detailed project documentation, see the `docs/` directory:

#### Development & Setup
- **[Database Workflow](docs/database-workflow.md)** - Complete database development guide
- **[Database Reset Guide](docs/database-reset-guide.md)** - Manual database reset instructions
- **[Progress Tracker](docs/plan-progress.md)** - Implementation progress and milestones

#### Architecture & Design
- **[Technical Specification](docs/kiotviet-tech-spec.md)** - Detailed technical requirements
- **[Architectural Strategy](docs/KIOTVIET_MVP_ARCHITECTURAL_STRATEGY.md)** - System architecture decisions
- **[Working Rules](docs/CLAUDE_RULES.md)** - Project development guidelines

#### API & Plans
- **[API Documentation](docs/api/)** - REST API documentation (coming soon)
- **[Implementation Plans](docs/plans/)** - Detailed implementation plans (coming soon)
- **[Design Documents](docs/design/)** - System design documents (coming soon)

## License

Private project for FA Training purposes.

## Support

For project questions and support, refer to:
- Project documentation in `/docs` directory
- Issue tracking in project management system
- Technical lead for architectural decisions