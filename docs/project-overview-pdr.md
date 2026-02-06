# KiotvietV2 - Product Development Requirements (PDR)

**Version**: 1.0
**Date**: February 6, 2026
**Timeline**: November 5 - December 17, 2025 (6 weeks)
**Status**: MVP Implementation Phase

---

## Executive Summary

KiotvietV2 is a multi-tenant product management system designed for large retail sellers in Vietnam with multiple store locations. The system provides comprehensive inventory management, product catalog management, and real-time stock tracking with performance optimization for high concurrent users.

**Target Market**: Large retail sellers (100+ concurrent users, 1000+ products per account)
**Architecture**: Multi-tenant SaaS with MySQL + Redis stack
**Current Phase**: MVP Implementation (Week 1 complete, Week 2 in progress)

---

## Business Model & Scale

### Target User Base

**Primary Users**:
- Retail store owners with 3+ store locations
- Warehouse managers handling inventory for multiple outlets
- Small-to-medium enterprise (SME) business owners
- Chain retailers managing product catalogs across stores

**User Personas**:
1. **Store Owner** (Admin): Manages overall business, views reports, controls access
2. **Warehouse Manager** (Manager): Handles inventory operations, stock adjustments
3. **Cashier** (Staff): Performs sales transactions, limited to POS functionality

### Business Requirements

**Core Value Propositions**:
- Centralized product catalog management across multiple locations
- Real-time inventory tracking with precision stock management
- Supplier relationship management for purchasing
- Vietnamese language support for local market compliance
- Scalable architecture supporting 100+ concurrent users per tenant

**Revenue Model** (Future):
- SaaS subscription with tiered pricing based on product count
- Premium features: Advanced analytics, POS integration, multi-store management
- Add-on modules: E-commerce integration, CRM, loyalty program

### Target Scale

**MVP Performance Targets**:
- 100+ concurrent users per tenant
- 1000+ products per account
- Page load time: <2 seconds (95th percentile)
- Search response: <500ms (95th percentile)
- API response time: <200ms average

---

## MVP Scope & Features

### Core Features Implemented

#### 1. Multi-Tenancy
- **Account-based isolation** with row-level security
- **JWT authentication** with 15-minute access tokens, 7-day refresh tokens
- **Role-based access control**: ADMIN, MANAGER, STAFF
- **Multi-device session management** with device tracking
- **Tenant context injection** for automatic data filtering

#### 2. User Management
- **Registration system** with business entity creation
- **Password management** with BCrypt hashing and validation rules
- **Password reset flow** with email verification (SMTP integration)
- **Session management** with secure logout and token invalidation
- **Account security**: Failed login tracking, device management

#### 3. Product Catalog
- **Product CRUD operations** with full validation
- **Multiple image support** per product with primary image selection
- **Hierarchical categories** with materialized path (unlimited depth)
- **Supplier management** with contact information and auto-complete search
- **Barcode & SKU management** with uniqueness validation
- **Vietnamese language support** throughout the interface

#### 4. Inventory Management
- **Real-time stock tracking** with pessimistic locking
- **Stock operations**: Increase, decrease, adjustment
- **Concurrency control**: Prevent overselling with database row locks
- **Transaction history** with full audit trail
- **Stock level indicators** and alerts
- **Account isolation** for multi-tenant data security

#### 5. Search & Filtering
- **Full-text search** with Vietnamese character support
- **Multiple filters**: Category, supplier, status, price range
- **Sorting options**: Name, price, created date
- **Pagination** for large result sets
- **Cache-aside pattern** for search optimization

---

## Success Criteria & KPIs

### Technical Metrics

| Metric | Target | Current Status |
|--------|--------|----------------|
| Page load time | <2s (95th percentile) | ~1.8s (Week 1) |
| Search response | <500ms (95th percentile) | ~350ms (Week 1) |
| API response time | <200ms average | ~150ms (Week 1) |
| Concurrent users | 100+ per tenant | 50+ tested (Week 1) |
| Cache hit rate | >80% | ~85% (Week 1) |
| Test coverage | 80%+ | 45% (Week 1) |

### Functional Metrics

| Metric | Target | Current Status |
|--------|--------|----------------|
| Products per account | 1000+ | 200+ (test data) |
| Inventory accuracy | 100% | 100% (concurrency control) |
| Search result accuracy | >85% | ~90% (Week 1) |
| User registration success | >95% | ~98% (Week 1) |
| Authentication success rate | >99% | ~99.5% (Week 1) |

### Business Metrics (Post-MVP)

| Metric | Target | Timeline |
|--------|--------|----------|
| Daily active users | 80% of total | Month 3 |
| Average products per account | 500+ | Month 3 |
| Inventory transactions/day | 5+ per account | Month 2 |
| Customer satisfaction | >4.5/5 | Month 3 |

---

## Functional Requirements

### User Management Requirements

**Priority**: CRITICAL

1. **Registration** (Implemented)
   - Create account with business information
   - Generate admin user with full access
   - Validate email format and uniqueness
   - Enforce password strength rules (8+ chars, mixed case, numbers, special)

2. **Authentication** (Implemented)
   - Login with email/password
   - JWT token generation and validation
   - Token refresh mechanism (automatic)
   - Secure logout with token invalidation
   - Multi-device session support

3. **Authorization** (Implemented)
   - Role-based access control (3 roles)
   - Permission inheritance (STAFF inherits basic access)
   - Resource-level permissions (CRUD operations per role)
   - Session-based authorization for API requests

4. **Security** (Implemented)
   - Password hashing with BCrypt salt
   - Failed login attempt tracking
   - Account lockout after 5 failed attempts (future)
   - Session timeout configuration
   - Device identification and management

### Product Management Requirements

**Priority**: CRITICAL

1. **Product Creation** (Implemented)
   - Input: SKU, barcode, name, description, category, supplier, prices, unit
   - Validation: Uniqueness checks, required fields, price range (0-1000000000 VND)
   - Business logic: Auto-generate SKU if blank, validate stock levels
   - Response: Product ID, SKU confirmation, primary image URL

2. **Product Editing** (Implemented)
   - Update all product fields except barcode (must remain unique)
   - Image management: Upload, reorder, set primary
   - Category/supplier assignment updates
   - Status management (draft/active/inactive)
   - Automatic image storage with filesystem organization

3. **Product Retrieval** (Implemented)
   - Single product details with relationships
   - Product list with pagination (20 per page default)
   - Search with multiple filters and sorting
   - Account isolation (no cross-tenant data access)
   - Caching for frequently accessed products

4. **Product Deletion** (Implemented)
   - Soft delete (status to inactive)
   - Prevent deletion if products assigned
   - Cascade validation checks
   - Audit trail preservation

### Category Management Requirements

**Priority**: HIGH

1. **Category Tree** (Implemented)
   - Unlimited hierarchical depth
   - Materialized path storage (e.g., "/electronics/mobile/phones")
   - Visual tree with expand/collapse
   - Product count per category
   - Indeterminate checkbox states

2. **Category CRUD** (Implemented)
   - Create category with parent assignment
   - Move category to different parent (with validation)
   - Rename category (inline edit)
   - Delete category (with validation: no products, no children)
   - Auto-path generation for new categories

3. **Category Search** (Implemented)
   - Substring matching (case-sensitive)
   - Auto-expand branches to reveal matches
   - Text highlighting for search results
   - Maintain selection state when clearing search

4. **Category Sorting** (Implemented)
   - Sort within parent levels
   - Custom sort order support (future)
   - Consistent display across tree levels

### Supplier Management Requirements

**Priority**: HIGH

1. **Supplier CRUD** (Implemented)
   - Create supplier with contact information
   - Update supplier details
   - Delete supplier (soft delete)
   - Validation: Name uniqueness per account, email format

2. **Supplier Search** (Implemented)
   - Real-time search with debouncing
   - Multiple criteria: Name, contact person, tax code
   - Filter by active status
   - Pagination with sorting
   - Auto-complete service for integration (future product forms)

3. **Supplier Details** (Implemented)
   - Full contact information display
   - Transaction history (future)
   - Performance metrics (future)
   - Payment terms tracking (future)

### Inventory Management Requirements

**Priority**: CRITICAL

1. **Stock Tracking** (Implemented)
   - Real-time quantity updates
   - Minimum/max stock level configuration
   - Stock status indicators (normal, low, out of stock)
   - Automatic transaction recording
   - Account isolation enforcement

2. **Stock Operations** (Implemented)
   - **Increase stock**: Batch quantity input, reason field
   - **Decrease stock**: Single or multiple products, sales transaction integration (future)
   - **Adjustment**: Manual stock change with audit trail
   - **Concurrency control**: Pessimistic locking prevents race conditions
   - **Validation**: Cannot decrease below 0

3. **Transaction History** (Implemented)
   - Complete audit trail for all stock changes
   - Filter by type (in/out/adjustment)
   - Filter by date range
   - Filter by product
   - Transaction details: Previous quantity, new quantity, quantity changed, notes

4. **Stock Alerts** (Implemented)
   - Low stock notification display
   - Min/max stock threshold warnings
   - Out-of-stock visual indicators
   - Future: Email alerts for bulk stockouts

### Search & Filtering Requirements

**Priority**: HIGH

1. **Search Functionality** (Implemented)
   - Full-text search on product names
   - Vietnamese character support (UTF-8)
   - Substring matching (case-sensitive)
   - Search by barcode (exact match)
   - Search results limit: 20 items per page

2. **Filtering** (Implemented)
   - Category filter (dropdown)
   - Supplier filter (dropdown)
   - Status filter (active/draft/inactive)
   - Price range filter (min/max)
   - Clear filters functionality

3. **Sorting** (Implemented)
   - Sort by name (asc/desc)
   - Sort by price (asc/desc)
   - Sort by created date (asc/desc)
   - Active sort indicator

4. **Pagination** (Implemented)
   - Page size: 20 items default
   - Page numbers display
   - Previous/Next navigation
   - Total item count
   - Current page indicator

---

## Non-Functional Requirements

### Performance Requirements

**Response Time Targets**:
- Page load: <2 seconds (95th percentile)
- Search query: <500ms (95th percentile)
- API endpoint: <200ms (average)
- Database query: <100ms (average)

**Concurrency Requirements**:
- Support 100+ concurrent users per tenant
- Support 1000+ products per account
- Handle race conditions in inventory operations

**Scalability Requirements**:
- Single database instance (MySQL) for MVP
- Redis caching for performance optimization
- Ready for database sharding (account-based) in post-MVP
- Ready for Elasticsearch migration (post-MVP)

### Security Requirements

**Authentication**:
- JWT token-based authentication
- 15-minute access token expiry
- 7-day refresh token with rotation
- BCrypt password hashing with 12 rounds
- Secure cookie configuration (httpOnly, Secure, SameSite)

**Authorization**:
- Role-based access control (3 roles)
- Permission inheritance
- Resource-level authorization
- Multi-tenant data isolation at database level
- Automatic account_id filtering in all queries

**Data Protection**:
- Password hashing with salt
- HTTPS-only communication (production)
- SQL injection prevention with parameterized queries
- XSS protection with output encoding
- CSRF protection (disabled for stateless APIs)

**Audit Trail**:
- Transaction recording for inventory changes
- User tracking in all operations
- Timestamps for all changes
- Future: Comprehensive audit log table

### Reliability Requirements

**Availability**:
- System uptime: 99.5% minimum
- Graceful degradation when Redis unavailable
- Automatic database connection retry
- No data loss on unexpected shutdowns

**Data Integrity**:
- Foreign key constraints enforced
- Unique constraints per account_id
- Cascade validation for relationships
- Transaction boundaries for critical operations

**Error Handling**:
- Comprehensive error messages
- Graceful degradation on failures
- User-friendly error displays
- Stack traces for debugging (development)

### Usability Requirements

**User Interface**:
- Responsive design (mobile, tablet, desktop)
- Vietnamese language labels throughout
- Clear visual hierarchy
- Consistent styling with Bootstrap 5
- Loading indicators for operations

**User Experience**:
- Intuitive navigation and workflows
- Progressive disclosure for complex forms
- Real-time validation feedback
- Success notifications for completed actions
- Error notifications for failed actions

**Accessibility**:
- Keyboard navigation support
- Screen reader compatibility
- High contrast color scheme
- Sufficient color indicators

### Maintainability Requirements

**Code Quality**:
- Domain-first architecture
- SOLID principles implementation
- Clear separation of concerns
- Comprehensive code documentation
- Consistent naming conventions

**Testing**:
- Unit tests for service layer (target: 80%+ coverage)
- Integration tests for API endpoints
- Concurrency tests for inventory operations
- Security tests for authentication/authorization
- Performance tests under load

**Documentation**:
- API documentation for all endpoints
- Database schema documentation
- User manual for end users
- Developer documentation for team
- Deployment guides for operations

---

## Technical Constraints

### Technology Stack

**Backend**:
- Java 21 LTS
- Spring Boot 3.5.7
- Spring Data JPA
- Spring Security with JWT
- Flyway database migrations
- Apache POI for Excel operations

**Database**:
- MySQL 8.0+
- utf8mb4 character set
- utf8mb4_unicode_ci collation
- Row-level security via application logic
- Composite indexes for performance

**Cache**:
- Redis 7.0+
- Cache-aside pattern
- TTL-based cache expiration
- Graceful degradation when Redis down

**Frontend**:
- Thymeleaf templates
- Bootstrap 5.3 for styling
- Vanilla JavaScript (no frameworks)
- AJAX for API interactions
- Responsive design

**Build Tool**:
- Maven 3.9+
- Lombok for boilerplate reduction
- Java 21 compiler

### Architecture Constraints

**Multi-Tenancy**:
- Account-based isolation (single database, shared schema)
- Row-level security via account_id filtering
- No database-per-tenant (MVP strategy)
- Automatic tenant context injection
- Tenant ID in JWT claims

**Domain-First Architecture**:
- Organize code by business domain
- Each domain: domain/, repository/, service/, exception/ packages
- Domain services handle business logic
- Separation between core domain and application layer

**Modular Architecture**:
- Frontend organized by feature modules
- Shared components for common functionality
- CSS scoped to components
- JavaScript modules for encapsulation

### Database Constraints

**Migration Strategy**:
- Flyway for version-controlled schema changes
- Sequential migration versions (V1, V2, V3...)
- Atomic migrations (all or nothing)
- Rollback procedures for each migration

**Indexing Strategy**:
- Composite indexes on (account_id, status)
- Composite indexes on (account_id, name) for search
- Foreign key indexes for join performance
- FULLTEXT index on product names for search

**Query Optimization**:
- Avoid N+1 query problems
- Use pagination for large datasets
- Lazy loading for relationships
- Connection pooling (HikariCP)

### Development Constraints

**File Size Limits**:
- Keep individual code files under 200 lines
- Extract utility functions into separate modules
- Use composition over inheritance for complex widgets
- Create dedicated service classes for business logic

**Commit Practices**:
- Use conventional commit format
- One feature per commit
- No merge commits in main branch
- Clean commit messages

**Testing Requirements**:
- Test-driven development when appropriate
- Comprehensive unit tests for business logic
- Integration tests for API endpoints
- Test new features before merging

---

## Non-Functional Requirement Summary

### Performance
- Page load <2s (95th percentile)
- Search <500ms (95th percentile)
- API <200ms average
- Support 100+ concurrent users
- Support 1000+ products per account

### Security
- JWT authentication with refresh tokens
- Role-based access control
- Multi-tenant data isolation
- BCrypt password hashing
- SQL injection prevention
- XSS and CSRF protection

### Reliability
- 99.5% system uptime
- Graceful degradation when Redis unavailable
- Data integrity with constraints and transactions
- Comprehensive error handling

### Usability
- Responsive design (all devices)
- Vietnamese language support
- Intuitive navigation
- Real-time validation
- Clear feedback messages

### Maintainability
- Domain-first architecture
- SOLID principles
- Comprehensive testing (80%+ coverage)
- Complete documentation

---

## Risk Assessment

### High Priority Risks

1. **Database Performance at Scale** (Risk Level: HIGH)
   - **Mitigation**: Early load testing, proper indexing, Redis caching, query optimization

2. **Multi-Tenant Data Leakage** (Risk Level: CRITICAL)
   - **Mitigation**: Comprehensive testing, code reviews, automated isolation tests

3. **Inventory Concurrency Bugs** (Risk Level: HIGH)
   - **Mitigation**: Pessimistic locking, extensive concurrency testing, transaction boundaries

### Medium Priority Risks

4. **Vietnamese Language Support** (Risk Level: MEDIUM)
   - **Mitigation**: UTF-8 everywhere, Vietnamese collation testing, accent-insensitive search (future)

5. **Image Upload Performance** (Risk Level: MEDIUM)
   - **Mitigation**: CDN integration (post-MVP), image optimization, CDN for production

---

## Acceptance Criteria

### MVP Must-Have Features

- ✅ User authentication and authorization (JWT)
- ✅ Multi-tenant data isolation
- ✅ Product CRUD operations
- ✅ Category management with hierarchical tree
- ✅ Supplier management
- ✅ Inventory tracking with concurrency control
- ✅ Product search with filters
- ✅ Multiple image upload per product
- ✅ Transaction history
- ✅ Vietnamese language support

### Performance Requirements

- ✅ Page load time <2 seconds
- ✅ Search response <500ms
- ✅ Support 100 concurrent users per tenant
- ✅ Support 1000 products per account

### Quality Requirements

- ✅ Zero critical security vulnerabilities
- ✅ No cross-tenant data leakage
- ✅ 80%+ test coverage
- ✅ Complete documentation

---

**Document Status**: Active
**Next Update**: After Week 2 completion (November 14, 2025)
**Owner**: Technical Documentation Specialist
