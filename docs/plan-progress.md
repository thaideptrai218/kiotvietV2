# Kiotviet MVP - Implementation Progress Tracker

**Project**: Multi-tenant Product Management System
**Timeline**: 6 Weeks (42 Days)
**Start Date**: November 5, 2025
**Target Date**: December 17, 2025

---

## WEEK 1: PROJECT SETUP & FOUNDATION (Days 1-7)

### Days 1-2: Project Initialization
- [x] **Create Spring Boot project with Maven**
  - [x] Initialize Maven project with Spring Boot 3.5.7
  - [x] Add required dependencies (Web, JPA, Security, Redis, Validation)
  - [x] Configure Java 17 and Lombok
  - [x] Set up project structure with packages

- [x] **Set up Git repository**
  - [x] Initialize git repository
  - [x] Create .gitignore file
  - [x] Make initial commit
  - [x] Set up README.md

- [x] **Configure MySQL database and create schema**
  - [x] Use MySQL 8.0 Docker image
  - [x] Create database `kiotviet_mvp` in Docker
  - [x] Configure database connection in application.properties
  - [x] Configure Flyway for automatic migrations
  - [x] Test database connectivity

- [x] **Set up Redis server**
  - [x] Use Redis 7-alpine Docker image
  - [x] Configure Redis connection in application.properties
  - [x] Test Redis connectivity
  - [x] Configure Redis settings for caching

- [x] **Create basic folder structure (frontend + backend)**
  - [x] Create Java package structure (controller, service, repository, entity, dto, config)
  - [x] Create frontend structure (css, js, templates)
  - [x] Create test structure
  - [x] Create documentation structure

- [x] **Configure Spring Security (basic setup)**
  - [x] Add Spring Security dependencies
  - [x] Create basic SecurityConfig
  - [x] Set up password encoder
  - [x] Test security configuration

### Days 3-4: User Management & Authentication
- [x] **Implement user registration endpoint**
  - [x] Create Account entity and repository
  - [x] Create UserInfo entity and repository
  - [x] Create UserAuth entity and repository
  - [x] Implement registration service
  - [x] Create registration controller endpoint
  - [x] Add input validation
  - [x] Test user registration

- [x] **Implement login endpoint with JWT generation**
  - [x] Add JWT dependencies
  - [x] Create JWT utility class
  - [x] Implement authentication service
  - [x] Create login controller endpoint
  - [x] Add JWT token generation
  - [x] Test login functionality
  - [x] Implement token refresh endpoint
  - [x] Implement logout functionality
  - [x] Add comprehensive error handling

- [x] **Refactor authentication services using SOLID principles**
  - [x] Separate monolithic AuthService into focused modules
  - [x] Create dedicated RegistrationService for user registration flow
  - [x] Create focused AuthService for authentication operations
  - [x] Implement proper business validation order
  - [x] Add JSON parsing error handling (400 responses)
  - [x] Apply Builder pattern for cleaner object initialization
  - [x] Test refactored authentication endpoints

- [x] **Create user tables (accounts, user_info, user_auth, user_tokens)**
  - [x] Write Flyway migration for user tables (V1 migration)
  - [x] Add proper indexes for multi-tenant queries
  - [x] Add foreign key constraints for data integrity
  - [x] Test table creation (verified in V1 migration)

- [x] **Implement password hashing with BCrypt**
  - [x] Configure BCrypt password encoder in SecurityConfig
  - [x] Update user creation to hash passwords with salt
  - [x] Test password hashing and verification (working)
  - [x] Add password validation rules (implemented in DTOs)

- [x] **Build login page (HTML + JavaScript)**
  - [x] Create login.html template
  - [x] Add styling with responsive design
  - [x] Create login form validation
  - [x] Add AJAX login functionality with loading states
  - [x] Create error handling and success messages
  - [x] Test login UI with Thymeleaf integration

- [x] **Build registration page with progressive disclosure**
  - [x] Create register.html template with 3-step accordion
  - [x] Add modern styling and animations
  - [x] Implement step validation and transitions
  - [x] Add password strength indicator
  - [x] Create responsive mobile-friendly design
  - [x] Test registration UI with all validation rules

- [x] **Setup Thymeleaf template engine**
  - [x] Add spring-boot-starter-thymeleaf dependency
  - [x] Configure Thymeleaf in application.yml
  - [x] Setup static resource serving (CSS/JS modules)
  - [x] Create LoginForm DTO for web forms
  - [x] Update AuthPageController to use proper DTOs

- [x] **Test authentication flow**
  - [x] Test user registration flow with validation
  - [x] Test login flow with AJAX submission
  - [x] Test form validation and error handling
  - [x] Test password validation rules
  - [x] Test responsive design on mobile devices

### Days 5-7: Security Foundation & Week 2 Preparation
- [x] **Authentication system complete** ✅
  - [x] Login/register with JWT tokens working
  - [x] Multi-tenant user structure in place
  - [x] JWT tokens contain companyId for future use

- [x] **Implement basic JWT validation filter**
  - [x] Create JwtAuthenticationFilter
  - [x] Validate JWT tokens on protected endpoints
  - [x] Handle token expiration
  - [x] Update SecurityConfig to require authentication for API endpoints
  - [x] Test JWT validation
  - [x] Fix JWT secret key configuration to read from YAML

- [ ] **Skip: Complex multi-tenancy (deferred)**
  - [x] ~~Account context injection filter~~ (deferred - JWT has companyId)
  - [x] ~~ThreadLocal tenant context~~ (deferred)
  - [x] ~~Multi-tenant data isolation testing~~ (deferred)

- [ ] **Skip: Empty dashboard (deferred)**
  - [x] ~~Build dashboard page shell~~ (deferred until business entities exist)
  - [x] ~~Dashboard navigation and layout~~ (deferred)
  - [x] ~~User information display~~ (deferred)

- [x] **Implement logout functionality**
  - [x] Create secure logout endpoint requiring authentication
  - [x] Invalidate refresh tokens on logout
  - [x] Add device-specific logout with ownership validation
  - [x] Refactor UserPrincipal to use Lombok annotations
  - [x] Add comprehensive logout testing scenarios

**Week 1 Deliverable**: ✅ Working authentication system with basic security

---

## WEEK 2: PARALLEL DEVELOPMENT - CATEGORIES & SUPPLIERS (Days 8-14)
**Team**: Developer A (Categories) + Developer B (Suppliers) working in parallel

---

### 🧩 **DEVELOPER A: CATEGORY MANAGEMENT**
**Business Purpose**: Group products for easier management, reporting, and POS navigation
**Requirements**: New category system from scratch with sophisticated tree UI

#### Days 8-10: Category Database & Backend
- [ ] **Create new categories table V6 with materialized path**
  - [ ] Design Category entity with unlimited hierarchy support
  - [ ] Write Flyway migration V6 for categories table
  - [ ] Materialized path field: "/drinks/soft-drinks/coke"
  - [ ] Add self-referencing foreign key for parent-child
  - [ ] Add indexes: (company_id, path), (company_id, parent_id), (company_id, is_active)
  - [ ] Test table creation with sample data

- [ ] **Implement Category entity and repository**
  - [ ] Create Category entity with JPA annotations and Lombok
  - [ ] Create CategoryRepository with account isolation
  - [ ] Add methods: findByCompanyId, findByParentId, findByPathStartingWith
  - [ ] Add tree building queries and path manipulation methods
  - [ ] Add soft delete support with is_active field

- [ ] **Create CategoryService with business logic**
  - [ ] Implement path generation for new categories
  - [ ] Add parent assignment validation (prevent cycles)
  - [ ] Create tree building algorithms
  - [ ] Add category movement logic with path updates
  - [ ] Add validation rules (name uniqueness per level)

- [ ] **Create Category API endpoints**
  - [ ] Create CategoryApiController with REST endpoints
  - [ ] GET /api/categories - Return flat list for tree building
  - [ ] POST /api/categories - Create new category
  - [ ] PUT /api/categories/{id} - Update category
  - [ ] DELETE /api/categories/{id} - Soft delete with validation
  - [ ] Add ResponseFactory for consistent responses

#### Days 11-12: Category Frontend with Sophisticated UI
- [ ] **Build category tree HTML structure**
  - [ ] Create category management HTML template
  - [ ] Build recursive tree with tri-state checkboxes
  - [ ] Add expand/collapse functionality (default collapsed)
  - [ ] Display product counts: "Beverages (23)"
  - [ ] Add pencil icon menu per category

- [ ] **Implement tri-state checkbox system**
  - [ ] Recursive selection: parent selects all children
  - [ ] Indeterminate state for partial selection
  - [ ] "Select All" for currently visible categories only
  - [ ] Apply button returns all selected category IDs
  - [ ] Maintain selection state during operations

- [ ] **Create CRUD operations via pencil menu**
  - [ ] Rename category (inline or modal)
  - [ ] Create subcategory functionality
  - [ ] Move category (change parent) with validation
  - [ ] Delete category with confirmation modal
  - [ ] Add validation: prevent delete if has children or products

#### Days 13-14: Category Advanced Features & Polish
- [ ] **Implement advanced search functionality**
  - [ ] Search with substring matching (case-sensitive)
  - [ ] Auto-expand branches to reveal matches
  - [ ] Optional text highlighting for matches
  - [ ] Maintain selection state when clearing search
  - [ ] Keep last expanded state option

- [ ] **Add category movement and validation**
  - [ ] Move category with path updates for all descendants
  - [ ] Prevent moving under self or descendants
  - [ ] Refresh affected branches after movement
  - [ ] Add animation for tree updates
  - [ ] Handle sort order within parent levels

- [ ] **Testing and UX improvements**
  - [ ] Test unlimited depth hierarchy with mock data
  - [ ] Test recursive selection and propagation
  - [ ] Test CRUD operations with validation
  - [ ] Add loading indicators and transitions
  - [ ] Test responsive design on mobile devices

---

### 🏭 **DEVELOPER B: SUPPLIER MANAGEMENT**
**Business Purpose**: Track suppliers, manage purchase relationships, and monitor debt/credit
**Requirements**: Basic debt tracking + auto-complete for future product integration

#### Days 8-10: Supplier Database & Backend
- [ ] **Create suppliers table V7 with basic debt tracking**
  - [ ] Design Supplier entity with contact info and basic debt fields
  - [ ] Write Flyway migration V7 for suppliers table
  - [ ] Add basic debt fields: outstanding_balance, last_payment_date, credit_limit
  - [ ] Add account_id, name, contact_person, phone, email, address, tax_code, website, notes
  - [ ] Add indexes: (company_id, name), (company_id, is_active), (contact_person), (tax_code)
  - [ ] Add unique constraint: (company_id, name)
  - [ ] Test table creation with sample data

- [ ] **Implement Supplier entity and repository**
  - [ ] Create Supplier entity with JPA annotations and Lombok
  - [ ] Create SupplierRepository with account isolation
  - [ ] Add methods: findByCompanyId, findByNameContaining, findByContactPerson, findByTaxCode
  - [ ] Add search functionality with case-insensitive options
  - [ ] Add soft delete support with is_active field
  - [ ] Add pagination support

- [ ] **Create SupplierService with validation**
  - [ ] Implement supplier name uniqueness validation per company
  - [ ] Add email format validation
  - [ ] Add tax code format validation
  - [ ] Add basic debt tracking methods
  - [ ] Create supplier search service with multiple criteria
  - [ ] Add contact information validation rules

- [ ] **Create Supplier API endpoints**
  - [ ] Create SupplierApiController with REST endpoints
  - [ ] GET /api/suppliers - List with pagination and search
  - [ ] POST /api/suppliers - Create new supplier
  - [ ] GET /api/suppliers/{id} - Get supplier details
  - [ ] PUT /api/suppliers/{id} - Update supplier
  - [ ] DELETE /api/suppliers/{id} - Soft delete supplier
  - [ ] GET /api/suppliers/search - Advanced search endpoint
  - [ ] Add ResponseFactory for consistent responses

- [ ] **Create auto-complete service for future integration**
  - [ ] Implement supplier search auto-complete API
  - [ ] Create endpoint: GET /api/suppliers/autocomplete?query=
  - [ ] Return limited results with id and display name for dropdowns
  - **Add product-supplier relationship preparation**
  - [ ] Add supplier_id field to products table (future V8 migration)
  - [ ] Test supplier selection in product forms
  - [ ] Create shared supplier search component

#### Days 11-12: Supplier Frontend with Auto-Complete
- [ ] **Build supplier management HTML structure**
  - [ ] Create supplier management HTML template
  - [ ] Build supplier list/table with responsive design
  - [ ] Add search and filter sidebar
  - [ ] Add supplier details modal for viewing
  - [ ] Add create/edit supplier modals

- [ ] **Create supplier forms and validation**
  - [ ] Create supplier creation form with all fields
  - [ ] Add supplier editing form with data population
  - [ ] Implement field validation (email, phone, tax code)
  - [ ] Add form validation messages and error handling
  - [ ] Add loading indicators for AJAX operations

- [ ] **Implement supplier search functionality**
  - [ ] Real-time search with debouncing
  - [ ] Multiple search criteria (name, contact, tax code)
  - [ ] Search result highlighting
  - [ ] Filter by active status
  - [ ] Pagination with page numbers and sorting

- [ ] **Create auto-complete component for integration**
  - [ ] Build reusable supplier auto-complete component
  - [ ] Keyboard navigation support
  - [ ] Selected value display and removal
  - [ ] Loading states and error handling
  - [ ] Test in context of future product forms

#### Days 13-14: Supplier Advanced Features & Polish
- [ ] **Implement supplier data management**
  - [ ] CSV import functionality with validation
  - [ ] CSV export with selected fields
  - [ ] Bulk supplier operations (activate/deactivate)
  - [ ] Supplier duplicate detection
  - [ ] Supplier contact management enhancement

- [ ] **Enhanced search and filtering**
  - [ ] Advanced search with multiple filter combinations
  - [ ] Search result caching for performance
  - [ ] Save search preferences and history
  - [ ] Search analytics and reporting
  - [ ] Performance optimization for large supplier lists

- [ ] **Testing and integration preparation**
  - [ ] End-to-end supplier creation and management flow
  - [ ] Test auto-complete component integration
  - [ ] Test supplier selection in product context
  - [ ] Mobile responsive design testing
  - ] Cross-browser compatibility testing

- [ ] **UX improvements and documentation**
  - [ ] Loading indicators and transitions
  - ] Keyboard shortcuts for navigation
  - **Success notifications for CRUD operations**
  - **Error handling with specific messages**
  - **API documentation for supplier endpoints**
  - **User guide for supplier management**
  - **Code documentation and integration guide**

---

### 🤝 **COORDINATION POINTS & INTEGRATION**

#### Shared Responsibilities:
- **Database Schema**: Coordinate Flyway migrations (V6 for categories, V7 for suppliers, V8 for product-supplier relationship)
- **Common UI Components**: Share modal dialogs, form components, loading indicators
- **Auto-Complete Component**: Create reusable supplier search component for future product forms
- **Authentication**: Both use existing JWT authentication system
- **Multi-tenancy**: Both implement account isolation consistently
- **Validation Patterns**: Use consistent validation approaches and error messaging

#### Integration Checkpoints:
- **Day 10**: Both backend APIs functional and tested
- **Day 12**: Supplier auto-complete component ready for future product integration
- **Day 14**: Final cross-module integration testing and code review

#### Business Flow Preparation:
- **Product Import Flow**: When importing goods → Select Supplier + Choose Category (both dropdowns ready)
- **Reporting Integration**: Categories for sales reports, Suppliers for debt tracking and purchase analysis
- **Example**: "Coca-Cola 330ml" → Category: "Drinks/Soft Drinks", Supplier: "Coca-Cola Vietnam Ltd."
- **Future Enhancement**: Product forms will use both category tree selection and supplier auto-complete components

#### Technical Standards:
- **Follow existing patterns**: @RequiredArgsConstructor, ResponseFactory, domain-first architecture
- **Multi-tenant enforcement**: Account isolation in all queries and operations
- **JWT Security**: All endpoints require authentication
- **Bootstrap 5 Integration**: Consistent styling with existing theme
- **RESTful Design**: Proper HTTP methods, status codes, and error responses
- **Database Optimization**: Proper indexing for search and hierarchical queries

---

### 🤝 **COORDINATION POINTS**

#### Shared Responsibilities:
- **Database Schema**: Coordinate Flyway migrations (V6, V7) to avoid conflicts
- **Common UI Components**: Share CSS classes and JavaScript utilities
- **Authentication**: Both use existing JWT authentication system
- **Multi-tenancy**: Both implement account isolation consistently

#### Integration Checkpoints:
- **Day 10**: Both backend APIs should be functional
- **Day 12**: Both frontend systems should connect to their APIs
- **Day 14**: Final integration testing and code review

#### Business Flow Preparation:
- **Product Import Flow**: When importing goods → Select Supplier + Choose Category
- **Reporting Integration**: Categories for sales reports, Suppliers for debt reports
- **Example**: "Coca-Cola 330ml" → Category: "Drinks/Soft Drinks", Supplier: "Coca-Cola Vietnam Ltd."

**Week 2 Deliverable**: ✅ Complete category and supplier management systems developed in parallel

### Days 12-14: Foundation Testing
- [ ] **Write unit tests for services**
  - [ ] Write tests for CategoryService
  - [ ] Write tests for SupplierService
  - [ ] Write tests for AuthService
  - [ ] Achieve 80%+ code coverage
  - [ ] Run tests and fix failures

- [ ] **Write integration tests for repositories**
  - [ ] Write tests for CategoryRepository
  - [ ] Write tests for SupplierRepository
  - [ ] Write tests for UserRepository
  - [ ] Test multi-tenant isolation
  - [ ] Test database constraints

- [ ] **Test multi-tenant isolation**
  - [ ] Create comprehensive isolation tests
  - [ ] Test data access patterns
  - [ ] Test security filter functionality
  - [ ] Document isolation test results
  - [ ] Fix any isolation issues

- [ ] **Fix bugs and refine UX**
  - [ ] Fix identified bugs from testing
  - [ ] Improve error messages
  - [ ] Enhance form validation UX
  - [ ] Add loading indicators
  - [ ] Improve responsive design

- [ ] **Code review and documentation**
  - [ ] Review all code for quality
  - [ ] Add JavaDoc comments
  - [ ] Update API documentation
  - [ ] Create setup guide
  - [ ] Document architectural decisions

**Week 2 Deliverable**: ✅ Complete category and supplier management

---

## WEEK 3: PRODUCT MANAGEMENT CORE (Days 15-21)

### Days 15-17: Product CRUD
- [ ] **Create products and product_images tables**
  - [ ] Design Product entity with required fields
  - [ ] Design ProductImage entity for multiple images
  - [ ] Write Flyway migrations for product tables
  - [ ] Add foreign key constraints
  - [ ] Add indexes for performance
  - [ ] Test table creation

- [ ] **Implement product CRUD endpoints**
  - [ ] Create Product entity with JPA annotations
  - [ ] Create ProductRepository with account isolation
  - [ ] Create ProductService with business logic
  - [ ] Create ProductController with REST endpoints
  - [ ] Add comprehensive validation
  - [ ] Add error handling for duplicate SKUs/barcodes
  - [ ] Test all product CRUD operations

- [ ] **Build product list UI with pagination**
  - [ ] Create product management HTML template
  - [ ] Build product list table with responsive design
  - [ ] Implement pagination controls
  - [ ] Add product status indicators
  - [ ] Add product image thumbnails
  - [ ] Test product list UI

- [ ] **Build add/edit product form**
  - [ ] Create product creation form
  - [ ] Add category selection dropdown
  - [ ] Add supplier selection dropdown
  - [ ] Add price and cost validation
  - [ ] Add stock level initialization
  - [ ] Add form validation and error display
  - [ ] Test product forms

- [ ] **Implement product validation**
  - [ ] Add SKU uniqueness validation per account
  - [ ] Add barcode uniqueness validation
  - [ ] Add price validation (positive numbers)
  - [ ] Add required field validation
  - [ ] Add business logic validation
  - [ ] Test validation rules

- [ ] **Test product operations**
  - [ ] Test product creation with all fields
  - [ ] Test product updates
  - [ ] Test product deletion (soft delete)
  - [ ] Test product account isolation
  - [ ] Test product validation rules

### Days 18-19: Image Upload
- [ ] **Implement image upload endpoint**
  - [ ] Create image upload controller method
  - [ ] Add multipart file handling
  - [ ] Add file type validation
  - [ ] Add file size validation
  - [ ] Generate unique filenames
  - [ ] Save files to filesystem
  - [ ] Test image upload

- [ ] **Configure file storage directory**
  - [ ] Create uploads directory structure
  - [ ] Configure Spring Boot static resource serving
  - [ ] Set up file permissions
  - [ ] Create directory structure per account/product
  - [ ] Test file serving

- [ ] **Build image uploader UI component**
  - [ ] Create file upload input with preview
  - [ ] Add drag-and-drop functionality
  - [ ] Add multiple file selection
  - [ ] Add upload progress indicator
  - [ ] Add image preview after upload
  - [ ] Test image uploader UI

- [ ] **Implement image preview and deletion**
  - [ ] Add image display in product form
  - [ ] Add primary image selection
  - [ ] Add image deletion functionality
  - [ ] Add image reordering
  - [ ] Update product image URLs
  - [ ] Test image management

- [ ] **Test image upload flow**
  - [ ] Test single image upload
  - [ ] Test multiple image upload
  - [ ] Test image file validation
  - [ ] Test image deletion
  - [ ] Test image serving in UI

### Days 20-21: Product Search
- [ ] **Set up FULLTEXT index on product name**
  - [ ] Add FULLTEXT index to products.name
  - [ ] Configure MySQL for full-text search
  - [ ] Test full-text search functionality
  - [ ] Optimize search queries
  - [ ] Test search performance

- [ ] **Implement search endpoint with filters**
  - [ ] Create product search service
  - [ ] Add search by product name
  - [ ] Add search by barcode (exact match)
  - [ ] Add category filter
  - [ ] Add supplier filter
  - [ ] Add status filter
  - [ ] Add sorting options
  - [ ] Add pagination to search results
  - [ ] Test search functionality

- [ ] **Build search UI with filter options**
  - [ ] Create search bar with autocomplete
  - [ ] Add filter dropdowns (category, supplier, status)
  - [ ] Add sort options (name, price, created date)
  - [ ] Add search results display
  - [ ] Add search result count
  - [ ] Add clear filters functionality
  - [ ] Test search UI

- [ ] **Implement search result caching**
  - [ ] Add Redis caching for search results
  - [ ] Implement cache invalidation on product updates
  - [ ] Add TTL for search cache
  - [ ] Monitor cache hit rates
  - [ ] Test search caching

- [ ] **Test search performance**
  - [ ] Test search with large dataset
  - [ ] Measure search response times
  - [ ] Test filter combinations
  - [ ] Test search with Vietnamese characters
  - [ ] Optimize slow queries

**Week 3 Deliverable**: ✅ Complete product management with search

---

## WEEK 4: INVENTORY MANAGEMENT (Days 22-28)

### Days 22-23: Inventory Core
- [ ] **Create inventory and inventory_transactions tables**
  - [ ] Design Inventory entity for stock tracking
  - [ ] Design InventoryTransaction entity for audit trail
  - [ ] Write Flyway migrations for inventory tables
  - [ ] Add foreign key constraints
  - [ ] Add indexes for performance
  - [ ] Test table creation

- [ ] **Implement inventory initialization for new products**
  - [ ] Auto-create inventory record when product created
  - [ ] Set initial stock levels from product creation
  - [ ] Set default min/max stock levels
  - [ ] Handle inventory creation for existing products
  - [ ] Test inventory initialization

- [ ] **Build inventory overview UI**
  - [ ] Create inventory management HTML template
  - [ ] Build inventory list with stock levels
  - [ ] Add low stock indicators
  - [ ] Add stock level status colors
  - [ ] Add inventory statistics
  - [ ] Test inventory UI

- [ ] **Implement stock level indicators**
  - [ ] Add visual indicators for stock levels
  - [ ] Implement low stock calculation
  - [ ] Add out-of-stock indicators
  - [ ] Add stock level tooltips
  - [ ] Test stock indicators

- [ ] **Test inventory display**
  - [ ] Test inventory list display
  - [ ] Test stock level calculations
  - [ ] Test inventory account isolation
  - [ ] Test inventory-product relationships

### Days 24-25: Stock Operations
- [ ] **Implement decrease stock endpoint with pessimistic locking**
  - [ ] Create decreaseStock method with SELECT FOR UPDATE
  - [ ] Add stock availability validation
  - [ ] Implement database transaction boundaries
  - [ ] Add optimistic locking for concurrency
  - [ ] Handle OutOfStockException
  - [ ] Test stock decrease with concurrent access

- [ ] **Implement increase stock endpoint**
  - [ ] Create increaseStock method with locking
  - [ ] Add stock transaction recording
  - [ ] Implement business validation
  - [ ] Add transaction logging
  - [ ] Test stock increase functionality

- [ ] **Implement stock adjustment endpoint**
  - [ ] Create manual stock adjustment method
  - [ ] Support both increase and decrease adjustments
  - [ ] Add adjustment reason tracking
  - [ ] Add audit trail for adjustments
  - [ ] Test stock adjustments

- [ ] **Build stock adjustment UI**
  - [ ] Create stock adjustment form
  - [ ] Add adjustment type selection (in/out)
  - [ ] Add quantity input with validation
  - [ ] Add notes/reason field
  - [ ] Add adjustment confirmation
  - [ ] Test adjustment UI

- [ ] **Test concurrency scenarios**
  - [ ] Test simultaneous stock decrease
  - [ ] Test race conditions
  - [ ] Test deadlock scenarios
  - [ ] Test transaction rollback
  - [ ] Verify no negative stock

### Days 26-28: Inventory Transactions
- [ ] **Build inventory transaction history UI**
  - [ ] Create transaction history HTML template
  - [ ] Build transaction list with filtering
  - [ ] Add transaction details display
  - [ ] Add transaction pagination
  - [ ] Add transaction export functionality
  - [ ] Test transaction UI

- [ ] **Implement transaction filtering**
  - [ ] Add filter by transaction type (in/out/adjustment)
  - [ ] Add filter by date range
  - [ ] Add filter by product
  - [ ] Add search functionality
  - [ ] Test filtering combinations

- [ ] **Add low stock alerts**
  - [ ] Implement low stock calculation
  - [ ] Add low stock notification in UI
  - [ ] Add low stock report
  - [ ] Add email alerts (future)
  - [ ] Test low stock detection

- [ ] **Test transaction recording**
  - [ ] Test transaction creation on stock changes
  - [ ] Test transaction data integrity
  - [ ] Test transaction account isolation
  - [ ] Test transaction history accuracy

- [ ] **Performance testing**
  - [ ] Test inventory operations under load
  - [ ] Measure response times
  - [ ] Test concurrent inventory updates
  - [ ] Optimize slow operations
  - ] Document performance results

**Week 4 Deliverable**: ✅ Complete inventory management with concurrency control

---

### 📋 Deferred Task: Dashboard Implementation
**Status**: Deferred until Week 4-5 (after business entities exist)
**Reason**: Dashboard requires business data (categories, products, inventory) to be meaningful
**Implementation Plan**:
- [ ] Build dashboard after completing categories, suppliers, products, and inventory management
- [ ] Include real metrics, charts, and data visualization
- [ ] Add navigation to completed business modules
- [ ] Create meaningful KPIs and analytics

---

## WEEK 5: CACHING & PERFORMANCE (Days 29-35)

### Days 29-30: Redis Integration
- [ ] **Implement cache-aside for products**
  - [ ] Add Redis caching for product data
  - [ ] Implement cache retrieval logic
  - [ ] Add cache population on cache miss
  - [ ] Add cache invalidation on product updates
  - [ ] Set appropriate TTL for product cache
  - [ ] Test product caching

- [ ] **Implement cache-aside for categories**
  - [ ] Add Redis caching for category trees
  - [ ] Cache full category hierarchy
  - [ ] Implement cache invalidation on category changes
  - [ ] Test category caching performance

- [ ] **Implement cache-aside for suppliers**
  - [ ] Add Redis caching for supplier data
  - [ ] Cache supplier lists and search results
  - [ ] Implement cache invalidation on supplier updates
  - [ ] Test supplier caching

- [ ] **Set up cache invalidation on updates**
  - [ ] Create cache invalidation service
  - [ ] Auto-invalidate related cache keys on updates
  - [ ] Handle cascade invalidation (category -> products)
  - [ ] Test cache invalidation scenarios

- [ ] **Test cache hit/miss rates**
  - [ ] Monitor cache performance
  - [ ] Measure hit rates for different entity types
  - [ ] Optimize cache key strategies
  - [ ] Adjust TTL values based on usage patterns
  - [ ] Document cache performance

### Days 31-32: Performance Optimization
- [ ] **Optimize database queries**
  - [ ] Analyze slow queries with EXPLAIN
  - [ ] Add missing database indexes
  - [ ] Optimize JOIN queries
  - [ ] Implement query result pagination
  - [ ] Test query performance improvements

- [ ] **Add missing indexes**
  - [ ] Review all queries for missing indexes
  - [ ] Add composite indexes for common filter patterns
  - [ ] Add indexes for foreign keys
  - [ ] Test index effectiveness
  - [ ] Document index strategy

- [ ] **Implement query result caching**
  - [ ] Cache frequently accessed query results
  - [ ] Implement smart cache warming
  - [ ] Add cache statistics monitoring
  - [ ] Test query caching impact

- [ ] **Optimize image loading**
  - [ ] Implement image lazy loading
  - [ ] Add image thumbnails generation
  - [ ] Optimize image compression
  - [ ] Add browser caching headers
  - [ ] Test image loading performance

- [ ] **Load testing with JMeter**
  - [ ] Create JMeter test plans for key scenarios
  - [ ] Test concurrent user load (100+ users)
  - [ ] Measure response times under load
  - [ ] Identify performance bottlenecks
  - [ ] Document load test results

### Days 33-35: Polish & UX
- [ ] **Improve error messages**
  - [ ] Review all error messages for clarity
  - [ ] Add user-friendly error descriptions
  - [ ] Add help text for validation errors
  - [ ] Implement consistent error formatting
  - [ ] Test error message UX

- [ ] **Add loading indicators**
  - [ ] Add loading spinners for AJAX requests
  - [ ] Add progress bars for long operations
  - [ ] Add loading states for form submissions
  - [ ] Implement skeleton screens for better UX
  - [ ] Test loading indicators

- [ ] **Implement success notifications**
  - [ ] Add toast notifications for successful operations
  - [ ] Add confirmation messages for critical actions
  - [ ] Implement auto-dismiss behavior
  - [ ] Add notification queue system
  - [ ] Test notification system

- [ ] **Responsive design improvements**
  - [ ] Test UI on mobile devices
  - [ ] Fix responsive layout issues
  - [ ] Optimize touch interactions
  - [ ] Test on different screen sizes
  - [ ] Validate responsive design

- [ ] **Vietnamese language labels**
  - [ ] Add Vietnamese language support
  - [ ] Create language switching mechanism
  - [ ] Translate UI labels
  - [ ] Test Vietnamese character display
  - [ ] Test Vietnamese search functionality

**Week 5 Deliverable**: ✅ Optimized system meeting performance targets

---

## WEEK 6: TESTING & DEPLOYMENT (Days 36-42)

### Days 36-37: Testing
- [ ] **Write comprehensive unit tests**
  - [ ] Complete unit tests for all service classes
  - [ ] Add tests for utility functions
  - [ ] Add tests for validation logic
  - [ ] Achieve 80%+ code coverage
  - [ ] Run test suite and fix failures

- [ ] **Write integration tests for all endpoints**
  - [ ] Write tests for all REST endpoints
  - [ ] Test database integration
  - [ ] Test Redis integration
  - [ ] Test security endpoints
  - [ ] Test file upload functionality

- [ ] **Test multi-device authentication**
  - [ ] Test login from multiple devices
  - [ ] Test concurrent sessions
  - [ ] Test token refresh on multiple devices
  - [ ] Test logout from specific devices
  - [ ] Test session limits

- [ ] **Test concurrent user scenarios**
  - [ ] Test 100+ concurrent users
  - [ ] Test simultaneous inventory operations
  - [ ] Test race conditions
  - [ ] Test system under heavy load
  - [ ] Document concurrency test results

- [ ] **Security testing (SQL injection, XSS, CSRF)**
  - [ ] Test for SQL injection vulnerabilities
  - [ ] Test for XSS vulnerabilities
  - [ ] Test CSRF protection
  - [ ] Test authentication bypass attempts
  - [ ] Document security test results

### Days 38-39: Documentation
- [ ] **API documentation**
  - [ ] Document all REST endpoints
  - [ ] Add request/response examples
  - [ ] Document authentication requirements
  - [ ] Add error response documentation
  - [ ] Create API testing guide

- [ ] **Database schema documentation**
  - [ ] Document all database tables
  - [ ] Document relationships and constraints
  - [ ] Document indexing strategy
  - [ ] Add database diagram
  - [ ] Document migration strategy

- [ ] **User manual**
  - [ ] Create user guide for all features
  - [ ] Add screenshots and step-by-step instructions
  - [ ] Document common workflows
  - [ ] Add troubleshooting section
  - [ ] Create quick start guide

- [ ] **Deployment guide**
  - [ ] Document installation process
  - [ ] Document configuration requirements
  - [ ] Add environment setup instructions
  - [ ] Document deployment steps
  - [ ] Add rollback procedures

- [ ] **Troubleshooting guide**
  - [ ] Document common issues and solutions
  - [ ] Add debugging procedures
  - [ ] Document log analysis
  - [ ] Add performance tuning tips
  - [ ] Create FAQ section

### Days 40-42: Deployment & Launch
- [ ] **Set up production database**
  - [ ] Create production MySQL database
  - [ ] Configure database security
  - [ ] Set up database backups
  - [ ] Run database migrations
  - [ ] Test database connectivity

- [ ] **Configure production Redis**
  - [ ] Set up production Redis instance
  - [ ] Configure Redis security
  - [ ] Set up Redis persistence
  - [ ] Test Redis connectivity
  - [ ] Monitor Redis performance

- [ ] **Deploy application to production server**
  - [ ] Build production JAR file
  - [ ] Configure production environment variables
  - [ ] Set up reverse proxy (nginx)
  - [ ] Configure SSL certificates
  - [ ] Deploy application
  - [ ] Test deployment

- [ ] **Performance monitoring setup**
  - [ ] Set up application monitoring
  - [ ] Configure log aggregation
  - [ ] Set up alerting rules
  - [ ] Monitor key metrics
  - [ ] Test monitoring systems

- [ ] **Pilot user onboarding**
  - [ ] Create pilot user accounts
  - [ ] Provide user training
  - [ ] Collect user feedback
  - [ ] Document user issues
  - [ ] Address user concerns

- [ ] **Bug fixes and final adjustments**
  - [ ] Fix reported bugs from pilot testing
  - [ ] Make final UX improvements
  - [ ] Optimize performance based on real usage
  - [ ] Update documentation
  - [ ] Prepare for production launch

**Week 6 Deliverable**: ✅ Production-ready MVP with documentation

---

## MVP ACCEPTANCE CRITERIA CHECKLIST

### Functional Requirements ✅
- [ ] User can register account and create admin user
- [ ] User can login/logout with JWT authentication
- [ ] Multi-tenant data isolation working correctly
- [ ] User can create/edit/delete products
- [ ] User can upload multiple images per product
- [ ] User can organize products in hierarchical categories
- [ ] User can assign suppliers to products
- [ ] User can search products with filters
- [ ] User can track inventory levels in real-time
- [ ] System prevents overselling (concurrency control)
- [ ] User can view inventory transaction history
- [ ] User receives low stock alerts
- [ ] User can perform manual stock adjustments

### Performance Requirements 🎯
- [ ] Page load time <2 seconds (95th percentile)
- [ ] Search response time <500ms (95th percentile)
- [ ] Support 100+ concurrent users per tenant
- [ ] Support 1000+ products per account
- [ ] Database query time <100ms (average)
- [ ] Cache hit rate >80% for cached entities

### Quality Requirements 🔒
- [ ] Zero critical security vulnerabilities
- [ ] No cross-tenant data leakage
- [ ] 80%+ test coverage
- [ ] Complete API documentation
- [ ] Complete user documentation
- [ ] Successful load testing with 100+ concurrent users

### Technical Requirements ⚙️
- [ ] MySQL database with proper indexing
- [ ] Redis caching implemented
- [ ] JWT authentication working
- [ ] Multi-tenant architecture implemented
- [ ] File upload functionality working
- [ ] Responsive web design
- [ ] Error handling implemented
- [ ] Logging and monitoring configured

---

## PROGRESS TRACKING

### Overall Progress: 23% (39/168 tasks completed)

**Week 1**: 100% (31/31 tasks completed)
- ✅ Spring Boot project setup with Maven
- ✅ Git repository with .gitignore and README
- ✅ MySQL 8.0 Docker setup with database
- ✅ Redis 7-alpine Docker setup
- ✅ Flyway migration scripts (V1-V5)
- ✅ Docker configuration and documentation
- ✅ Database workflow documentation
- ✅ Basic folder structure (frontend + backend)
- ✅ User registration and login endpoints with JWT
- ✅ Authentication service refactoring with SOLID principles
- ✅ JSON parsing error handling (400 responses)
- ✅ Builder pattern implementation for cleaner code
- ✅ Comprehensive validation and business logic fixes
- ✅ User tables creation with proper indexes and constraints
- ✅ BCrypt password hashing implementation with salt

**Week 2**: 0% (0/20 tasks completed)
**Week 3**: 0% (0/19 tasks completed)
**Week 4**: 0% (0/17 tasks completed)
**Week 5**: 0% (0/17 tasks completed)
**Week 6**: 0% (0/20 tasks completed)

### Last Updated: November 7, 2025
**Next Milestone**: Complete Week 1 - Project Setup & Foundation ✅

### Recent Achievements:
- ✅ Login page with modern responsive design and AJAX functionality
- ✅ Registration page with 3-step progressive disclosure accordion
- ✅ Thymeleaf template engine setup and configuration
- ✅ Professional CSS/JS module organization
- ✅ Complete authentication flow with real-time validation
- ✅ Strategic decision to defer empty dashboard until business entities exist
- ✅ Simplified security approach (JWT validation only) for faster development

---

## NOTES & BLOCKERS

### Current Blockers:
- None

### Decisions Made:
- Multi-tenant architecture with account_id isolation
- MySQL + Redis technology stack
- JWT authentication with refresh tokens
- Hierarchical categories with materialized path
- Pessimistic locking for inventory operations
- Local filesystem image storage for MVP

### Risk Mitigation:
- Comprehensive testing planned for Week 6
- Performance testing scheduled for Week 5
- Security testing included in Week 6
- Pilot user testing planned for Week 6

---

*This document should be updated daily to track progress. Mark tasks as completed with [x] as they are finished.*