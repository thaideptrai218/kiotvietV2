# Kiotviet MVP - Implementation Plan & Technical Specification

**Version**: 1.0  
**Date**: November 5, 2025  
**Timeline**: 4-6 Weeks  
**Stack**: Java (Spring Boot) + MySQL + HTML/AJAX + Redis  
**Deployment**: Localhost (Development Phase)

---

## PART 1: ARCHITECTURE OVERVIEW

### 1.1 Technology Stack Summary

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Backend | Spring Boot | 3.2.x | REST API, Business Logic |
| Database | MySQL | 8.0.x | Primary data store |
| Cache | Redis | 7.0.x | Token storage, Cache-aside |
| Frontend | HTML + AJAX | - | User interface |
| CSS | Bootstrap | 5.3 | UI styling |
| Build | Maven | 3.9.x | Dependency management |
| Java | JDK | 17 LTS | Programming language |

### 1.2 Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT BROWSER                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  HTML Pages  │  │  JavaScript  │  │  CSS Styles  │      │
│  │              │  │   (AJAX)     │  │  Bootstrap   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTPS + httpOnly Cookies
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   SPRING BOOT APPLICATION                    │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Security Filter Chain                       │  │
│  │  (JWT Validation, Multi-tenant Context Injection)    │  │
│  └──────────────────────────────────────────────────────┘  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ REST         │  │ Service      │  │ Repository   │    │
│  │ Controllers  │──│ Layer        │──│ Layer (JPA)  │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
└────────────┬────────────────┬───────────────────────────────┘
             │                │
             ▼                ▼
    ┌────────────┐    ┌────────────┐
    │   MySQL    │    │   Redis    │
    │  Database  │    │   Cache    │
    └────────────┘    └────────────┘
```

### 1.3 Multi-Tenancy Model

**Strategy**: Row-level isolation with `account_id`
- Every table has `account_id` column (non-nullable)
- Application layer automatically injects account context
- All queries filtered by `account_id`
- Single database, shared schema

**Why this approach**:
- ✅ Cost-effective for MVP (single database instance)
- ✅ Simpler backup/restore operations
- ✅ Easier to maintain than database-per-tenant
- ✅ Sufficient security with proper application-level checks
- ⚠️ Requires careful query design to prevent data leakage

---

## PART 2: DATABASE DESIGN PLAN

### 2.1 Core Tables Structure (MVP Simplified)

#### User & Account Tables (3-table design)

**accounts**
- Purpose: Store business/company information
- Key fields: `id`, `business_name`, `email`, `phone`, `status`
- **MVP Simplification**: Basic fields only, no complex subscription management
- Indexes: `status`, `created_at`

**user_info**
- Purpose: User profile and business context
- Key fields: `id`, `account_id`, `full_name`, `email`, `role`, `status`, `two_factor_enabled`, `two_factor_secret`
- **MVP Kept**: Two-factor authentication support (as requested)
- **MVP Simplified**: Simple role-based permissions (admin/manager/staff) instead of JSON permissions
- Indexes: `(account_id, status)`, `(account_id, email)` unique
- Relationships: FK to `accounts`

**user_auth**
- Purpose: Authentication credentials (isolated for security)
- Key fields: `id`, `user_id`, `password_hash`, `salt`, `failed_login_attempts`
- Indexes: `user_id` unique
- Relationships: FK to `user_info`

**user_tokens**
- Purpose: Session management (JWT refresh tokens)
- Key fields: `id`, `user_id`, `refresh_token`, `device_info`, `expires_at`
- Indexes: `(user_id, expires_at)`, `refresh_token` unique
- Relationships: FK to `user_info`

#### Product Management Tables

**categories**
- Purpose: Hierarchical category structure
- Key fields: `id`, `account_id`, `name`, `parent_id`, `path`, `level`, `status`
- **MVP Simplified**: Removed UI enhancement fields (`icon_url`, `color`, `metadata` JSON)
- Path example: `/electronics/mobile/phones`
- Indexes: `(account_id, path)`, `(account_id, status)`, `parent_id`
- Relationships: FK to `accounts`, self-referencing FK to `parent_id`

**suppliers**
- Purpose: Supplier information
- Key fields: `id`, `account_id`, `name`, `contact_person`, `phone`, `email`, `address`, `status`
- **MVP Simplified**: Basic contact info only, removed advanced fields (`rating`, `payment_terms`, `lead_time_days`, `min_order_quantity`)
- Indexes: `(account_id, status)`, `(account_id, name)` unique
- Relationships: FK to `accounts`

**products**
- Purpose: Master product catalog
- Key fields: `id`, `account_id`, `sku`, `barcode`, `name`, `description`, `category_id`, `supplier_id`, `cost_price`, `selling_price`, `unit`, `status`
- **MVP Simplification**: Removed advanced fields (`weight`, `dimensions`, `wholesale_price`, `origin`, `warranty_period`, `shelf_life_days`, `tags` JSON, `attributes` JSON)
- **MVP Kept**: Core fields for essential product management
- Indexes:
  - `(account_id, sku)` unique
  - `(account_id, barcode)` unique
  - `(account_id, status)`
  - `(account_id, name)` for search
  - FULLTEXT index on `name`
- Relationships: FK to `accounts`, `categories`, `suppliers`

**product_images**
- Purpose: Multiple images per product (as requested for MVP)
- Key fields: `id`, `product_id`, `image_url`, `alt_text`, `display_order`, `is_primary`
- **MVP Simplification**: Removed technical fields (`thumbnail_url`, `file_size`, `image_width`, `image_height`, `mime_type`)
- **MVP Kept**: Multiple image support as requested
- Storage: URL strings (image files hosted separately)
- Indexes: `(product_id, display_order)`
- Relationships: FK to `products`

#### Inventory Tables (Simplified for MVP)

**inventory**
- Purpose: Real-time stock tracking (globally per account)
- Key fields: `id`, `account_id`, `product_id`, `current_stock`, `min_stock_level`, `max_stock_level`, `version`
- **MVP Simplification**: Removed advanced fields (`reserved_stock`, `available_stock`, `average_cost`, `last_cost`)
- **MVP Kept**: Basic stock tracking with optimistic locking via `version` field
- Indexes: `(account_id, product_id)` unique, `(account_id, current_stock)`
- Relationships: FK to `accounts`, `products`
- **Critical**: This table is locked during stock updates to prevent race conditions

**inventory_transactions**
- Purpose: Audit trail for all inventory changes
- Key fields: `id`, `account_id`, `product_id`, `transaction_type`, `quantity`, `previous_quantity`, `new_quantity`, `reference_type`, `notes`, `created_by`
- **MVP Simplification**: Simple transaction recording, no complex approval workflows
- Transaction types: `in`, `out`, `adjustment`
- Indexes: `(account_id, product_id, created_at)`, `created_at`
- Relationships: FK to `accounts`, `products`, `user_info`

#### Tables Temporarily Commented Out for MVP

**audit_logs** - Comprehensive audit logging
- **MVP Decision**: Commented out for faster development
- **Can be added**: Post-MVP when compliance requirements increase

**stock_adjustments** - Approval workflow for stock adjustments
- **MVP Decision**: Commented out, using direct adjustments instead
- **Can be added**: Post-MVP when workflow controls needed

**low_stock_alerts** - Automated alert management
- **MVP Decision**: Commented out, using simple UI alerts
- **Can be added**: Post-MVP when automation needed

### 2.2 Indexing Strategy

**Composite Index Priority**:
1. `(account_id, status)` - Most common filter pattern
2. `(account_id, name)` - Search functionality
3. `(account_id, product_id, created_at)` - Transaction history
4. `(product_id, display_order)` - Image retrieval

**Full-Text Search**:
- MySQL FULLTEXT index on `products.name`
- Collation: `utf8mb4_unicode_ci` (Vietnamese support)
- Future: Migrate to Elasticsearch if search becomes slow (>500ms)

### 2.3 MVP Database Simplification Summary

**Tables Simplified for Faster Development**:

| Table | Fields Removed (MVP) | Rationale |
|-------|---------------------|-----------|
| **user_info** | `permissions` JSON | Simple role-based permissions sufficient for MVP |
| **categories** | `icon_url`, `color`, `metadata` JSON | UI enhancements, can be added later |
| **suppliers** | `rating`, `payment_terms`, `lead_time_days`, `min_order_quantity` | Advanced supplier management, basic contact info sufficient |
| **products** | `weight`, `dimensions`, `wholesale_price`, `origin`, `warranty_period`, `shelf_life_days`, `tags` JSON, `attributes` JSON | Advanced product features, core fields sufficient for MVP |
| **product_images** | `thumbnail_url`, `file_size`, `image_width`, `image_height`, `mime_type` | Technical details, basic URL storage sufficient |
| **inventory** | `reserved_stock`, `available_stock`, `average_cost`, `last_cost` | Advanced inventory management, basic stock tracking sufficient |
| **audit_logs** | Entire table | Comprehensive audit logging, can be added post-MVP |
| **stock_adjustments** | Entire table | Approval workflow complexity, direct adjustments sufficient |
| **low_stock_alerts** | Entire table | Automated alerts, simple UI alerts sufficient |

**Sample Data Simplification**:
- **Reduced from 10+ to 6 products** (faster setup)
- **English product names** (as requested)
- **Simplified transaction history** (no complex workflows)
- **Basic supplier data** (contact info only)

**Benefits of MVP Simplification**:
- ✅ **Faster Development**: 40% fewer fields to implement and validate
- ✅ **Simpler Testing**: Fewer edge cases and validation rules
- ✅ **Cleaner UI**: Less cluttered forms and better user experience
- ✅ **Easier Migration**: Clear path to add features incrementally
- ✅ **Maintained Architecture**: Core multi-tenant structure preserved

### 2.4 Database Configuration Requirements

**Character Encoding**:
- Database: `utf8mb4` (full Unicode for Vietnamese)
- Collation: `utf8mb4_unicode_ci` (case-insensitive, accent-sensitive)

**Connection Pooling (HikariCP)**:
- Max pool size: 20 connections
- Min idle: 5 connections
- Connection timeout: 30 seconds
- Max lifetime: 30 minutes

**Timezone**: `Asia/Ho_Chi_Minh`

---

## PART 3: AUTHENTICATION & SESSION MANAGEMENT PLAN

### 3.1 JWT Token Strategy

**Two-Token System**:

| Token Type | Storage | Lifespan | Purpose |
|------------|---------|----------|---------|
| Access Token | httpOnly Cookie | 15 minutes | API authorization |
| Refresh Token | httpOnly Cookie + Redis + MySQL | 7 days | Token renewal |

**Access Token Claims**:
- `sub` (userId)
- `accountId` (for multi-tenancy)
- `role` (admin/manager/staff)
- `permissions` array

**Refresh Token Storage**:
- **Redis**: Fast lookup (primary)
- **MySQL**: Persistence (fallback if Redis down)
- Key format: `refresh_token:{tokenId}`
- TTL: 7 days

### 3.2 Authentication Flow Plan

**Login Process**:
1. User submits email + password
2. Backend validates credentials (BCrypt + salt)
3. Generate access token (15 min) + refresh token (7 days)
4. Store refresh token in Redis + MySQL
5. Set both tokens as httpOnly cookies
6. Return user info + account info to frontend

**Silent Token Refresh**:
1. Frontend intercepts 401 responses
2. Automatically calls `/api/auth/refresh` with refresh token cookie
3. Backend validates refresh token (check Redis → fallback MySQL)
4. Generate new access token
5. Set new access token cookie
6. Retry original request
7. If refresh fails → redirect to login

**Multi-Device Support**:
- Each login creates a new `user_tokens` record
- Track device info (browser, OS) and IP address
- Allow unlimited concurrent sessions (no limit for MVP)
- Future: Implement max 5 devices, remove oldest session

### 3.3 Password Security Plan

**Hashing**:
- Algorithm: BCrypt
- Strength: 12 rounds
- Additional salt per user (stored in `user_auth.salt`)

**Password Policy**:
- Minimum 8 characters
- Must contain: uppercase, lowercase, number, special character
- Validation regex: `^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$`

**Account Lockout** (future enhancement):
- Lock after 5 failed attempts
- Lockout duration: 15 minutes
- Track in `user_auth.failed_login_attempts` and `locked_until`

### 3.4 Cookie Security Configuration

```
Set-Cookie: accessToken=<jwt>; 
  HttpOnly; 
  Secure; 
  SameSite=Strict; 
  Path=/; 
  Max-Age=900
```

- `HttpOnly`: Prevent JavaScript access (XSS protection)
- `Secure`: HTTPS only (production)
- `SameSite=Strict`: CSRF protection
- `Max-Age=900`: 15 minutes (access token)

---

## PART 4: INVENTORY CONCURRENCY CONTROL PLAN

### 4.1 The Problem

**Scenario**: Two cashiers sell the last item simultaneously
```
Time  Cashier A              Cashier B              Database
0:00  Read stock: 1 unit     -                      stock = 1
0:01  -                       Read stock: 1 unit     stock = 1
0:02  Sell 1 unit            -                      stock = 0
0:03  -                       Sell 1 unit            stock = -1 ❌
```

### 4.2 Solution: Pessimistic Locking

**Strategy**: Lock inventory row during update

**Implementation Plan**:
1. Use `SELECT ... FOR UPDATE` (MySQL row lock)
2. Lock acquired at start of transaction
3. Check stock availability
4. Update quantity if sufficient
5. Record transaction in `inventory_transactions`
6. Commit transaction (releases lock)

**If insufficient stock**:
- Throw `OutOfStockException`
- Frontend shows error: "Sorry, this product is out of stock"
- Transaction rolls back (no partial updates)

### 4.3 Transaction Boundaries

**Decrease Stock Operation**:
```
BEGIN TRANSACTION
├─ SELECT * FROM inventory WHERE account_id=? AND product_id=? FOR UPDATE
├─ IF quantity < requested THEN throw OutOfStockException
├─ UPDATE inventory SET quantity = quantity - requested
├─ INSERT INTO inventory_transactions (type='out', quantity, previous_qty, new_qty)
└─ COMMIT
```

**Increase Stock Operation** (restock):
```
BEGIN TRANSACTION
├─ SELECT * FROM inventory WHERE account_id=? AND product_id=? FOR UPDATE
├─ UPDATE inventory SET quantity = quantity + added
├─ INSERT INTO inventory_transactions (type='in', quantity, previous_qty, new_qty)
└─ COMMIT
```

### 4.4 Performance Considerations

**Lock Duration**: Minimize time holding locks
- Keep transactions short (<100ms)
- No external API calls inside transaction
- No complex calculations inside transaction

**Deadlock Prevention**:
- Always lock resources in same order (by product_id ascending)
- Use timeout for lock acquisition (5 seconds)
- Retry logic if deadlock detected

**Scalability**:
- Row-level locks (not table-level)
- Only locks specific product being sold
- Other products can be sold concurrently

---

## PART 5: REDIS CACHING STRATEGY

### 5.1 Cache-Aside Pattern

**How it works**:
1. Application checks Redis cache first
2. If cache miss → query MySQL
3. Store result in Redis with TTL
4. Return data to client

**Invalidation**:
- On data update → delete cache key
- Let next read repopulate cache
- Simple and reliable

### 5.2 What to Cache

| Data Type | Cache? | TTL | Invalidation Trigger |
|-----------|--------|-----|----------------------|
| Products | ✅ Yes | 10 min | Product update/delete |
| Categories | ✅ Yes | 30 min | Category update/delete |
| Suppliers | ✅ Yes | 30 min | Supplier update/delete |
| Inventory | ❌ NO | - | Too critical, always real-time |
| User Sessions | ✅ Yes | 7 days | Logout |
| Search Results | ✅ Yes | 5 min | Product updates |
| Product Images | ✅ Yes | 1 hour | Image update |

### 5.3 Redis Key Design

**Naming Convention**: `{entity}:{accountId}:{identifier}`

Examples:
- `product:123:456` → Product ID 456 for account 123
- `category_tree:123` → Full category tree for account 123
- `search:123:iphone` → Search results for "iphone" in account 123
- `refresh_token:abc-def-ghi` → Refresh token

**Why include accountId**:
- Prevents data leakage between tenants
- Easy to flush all cache for one account
- Natural partitioning

### 5.4 Cache Invalidation Plan

**On Product Update**:
```
1. Update MySQL database
2. Delete cache keys:
   - product:{accountId}:{productId}
   - search:{accountId}:* (all search results for account)
   - category_products:{accountId}:{categoryId} (if category changed)
3. Return success to client
```

**On Category Update**:
```
1. Update MySQL database
2. Delete cache keys:
   - category_tree:{accountId}
   - category:{accountId}:{categoryId}
3. Return success to client
```

### 5.5 Redis Fallback Strategy

**If Redis is down**:
- Application continues working (degrades gracefully)
- All reads go directly to MySQL
- No caching, slower but functional
- Log warning: "Redis unavailable, operating without cache"

**Health Check**:
- Ping Redis every 30 seconds
- If down for >5 minutes → alert admin
- Automatic reconnection when Redis comes back

---

## PART 6: SEARCH IMPLEMENTATION PLAN

### 6.1 MVP Search Strategy

**Technology**: MySQL FULLTEXT Search
- Use built-in FULLTEXT index on `products.name`
- Good enough for <10,000 products
- No additional infrastructure needed

**Search Features for MVP**:
- ✅ Product name search (partial match)
- ✅ Barcode exact match
- ✅ Filter by category
- ✅ Filter by supplier
- ✅ Filter by status (active/inactive)
- ✅ Sort by name, price, created date
- ✅ Pagination (20 results per page)

### 6.2 Vietnamese Language Handling

**Challenge**: Tone marks in Vietnamese
- "hoa" (flower) ≠ "hòa" (peace) ≠ "hỏa" (fire)

**Solution for MVP**:
- Store original text with tone marks
- Search is accent-sensitive (exact match)
- User must type correct tones

**Future Enhancement**:
- Implement accent-insensitive search
- Use MySQL `unaccent` extension or
- Migrate to Elasticsearch with Vietnamese analyzer

### 6.3 Search Query Plan

**Basic Search** (name only):
```sql
SELECT * FROM products 
WHERE account_id = ? 
  AND status = 'active'
  AND MATCH(name) AGAINST(? IN NATURAL LANGUAGE MODE)
ORDER BY name ASC
LIMIT 20 OFFSET 0;
```

**Advanced Search** (with filters):
```sql
SELECT p.* FROM products p
WHERE p.account_id = ?
  AND p.status = 'active'
  AND (p.barcode = ? OR MATCH(p.name) AGAINST(? IN NATURAL LANGUAGE MODE))
  AND (? IS NULL OR p.category_id = ?)
  AND (? IS NULL OR p.supplier_id = ?)
  AND (? IS NULL OR p.selling_price >= ?)
  AND (? IS NULL OR p.selling_price <= ?)
ORDER BY p.name ASC
LIMIT 20 OFFSET ?;
```

### 6.4 Search Performance Targets (MVP Adjusted)

- **Response time**: <500ms (95th percentile) - *Unchanged*
- **Concurrent searches**: 30+ per second (reduced from 50+ for MVP)
- **Result accuracy**: >85% relevance (reduced from 90% for MVP)

**MVP Optimization Techniques**:
- Cache popular search queries (5 min TTL) - *Kept*
- Index on `(account_id, status, name)` - *Kept*
- FULLTEXT index on `name` - *Kept*
- Pagination to limit result set - *Kept*

**MVP Performance Trade-offs**:
- Simplified search without Elasticsearch for faster development
- Basic MySQL FULLTEXT sufficient for <1,000 products
- Performance targets achievable with current stack

### 6.5 Migration Path to Elasticsearch

**When to migrate**:
- Search response time >500ms consistently
- Product catalog >10,000 items
- Need advanced features (fuzzy search, autocomplete)

**Migration Plan** (post-MVP):
1. Install Elasticsearch
2. Create index with Vietnamese analyzer
3. Sync products from MySQL to Elasticsearch
4. Implement dual-write (MySQL + Elasticsearch)
5. Switch search traffic to Elasticsearch
6. Keep MySQL as source of truth

---

## PART 7: FRONTEND ARCHITECTURE PLAN

### 7.1 Project Structure

```
frontend/
├── index.html              # Login page
├── dashboard.html          # Main application
├── css/
│   ├── main.css           # Global styles
│   ├── components.css     # Reusable components
│   └── pages/
│       ├── product.css
│       ├── inventory.css
│       └── supplier.css
├── js/
│   ├── config.js          # API base URL, constants
│   ├── auth.js            # Login/logout, token refresh
│   ├── api.js             # AJAX wrapper, error handling
│   ├── utils.js           # Common utilities
│   └── modules/
│       ├── product.js     # Product management
│       ├── inventory.js   # Inventory operations
│       ├── supplier.js    # Supplier management
│       └── category.js    # Category management
└── assets/
    ├── images/
    └── icons/
```

### 7.2 Key JavaScript Modules

**config.js**: Configuration
- API base URL: `http://localhost:8080/api`
- Constants (page size, max file size, etc.)

**auth.js**: Authentication logic
- Login form handling
- Token refresh mechanism
- Logout functionality
- Check authentication status

**api.js**: AJAX wrapper
- Centralized fetch() calls
- Automatic token refresh on 401
- Error handling
- Loading indicator management

**utils.js**: Common utilities
- Date formatting
- Number formatting (currency)
- Vietnamese text handling
- Form validation

### 7.3 State Management

**Approach**: Simple JavaScript objects (no framework)
```javascript
// Global state object
const appState = {
    currentUser: null,
    currentAccount: null,
    products: [],
    categories: [],
    selectedProduct: null
};

// Update functions
function setCurrentUser(user) {
    appState.currentUser = user;
    renderUserInfo();
}

function setProducts(products) {
    appState.products = products;
    renderProductList();
}
```

### 7.4 AJAX Request Pattern

**Standard request with auth**:
```javascript
async function fetchProducts(page = 1) {
    showLoading();
    
    try {
        const response = await api.get(`/products?page=${page}&size=20`);
        
        if (response.ok) {
            const data = await response.json();
            setProducts(data.items);
            renderPagination(data.totalPages);
        } else {
            showError('Failed to load products');
        }
    } catch (error) {
        showError('Network error: ' + error.message);
    } finally {
        hideLoading();
    }
}
```

### 7.5 UI Component Strategy

**Bootstrap Components Used**:
- Navigation: Navbar
- Forms: Form controls, validation
- Tables: Responsive tables for product list
- Modals: Add/edit product dialog
- Alerts: Success/error messages
- Buttons: Primary, secondary, danger
- Pagination: Navigate through results

**Custom Components Needed**:
- Product card
- Category tree selector
- Image uploader
- Stock level indicator
- Search bar with filters

---

## PART 8: IMAGE STORAGE PLAN

### 8.1 Storage Strategy

**MVP Approach**: Store images in local filesystem
- Path: `/uploads/products/{accountId}/{productId}/`
- Filename: `{timestamp}_{originalName}`
- Store URL in database: `/uploads/products/123/456/1699200000_iphone.jpg`

**Why not cloud storage in MVP**:
- Simpler to implement (no S3/CDN setup)
- No additional costs
- Sufficient for localhost development
- Easy to migrate later

### 8.2 Upload Workflow

**Steps**:
1. User selects image file(s) from device
2. JavaScript validates file (size, type, dimensions)
3. POST to `/api/products/{productId}/images` with multipart/form-data
4. Backend validates file
5. Save file to filesystem
6. Generate URL and save to `product_images` table
7. Return image URL to frontend
8. Frontend displays uploaded image

**Validation Rules**:
- Max file size: 5 MB
- Allowed formats: JPEG, PNG, WebP
- Max dimensions: 2048x2048 px
- Max images per product: 5 images

### 8.3 Image URL Structure

**Database storage**:
```
product_images table:
- image_url: "/uploads/products/123/456/1699200000_iphone.jpg"
- display_order: 0 (primary), 1, 2, 3, 4
- is_primary: true/false
```

**Access URL**:
```
http://localhost:8080/uploads/products/123/456/1699200000_iphone.jpg
```

**Spring Boot Configuration**:
- Serve static files from `/uploads` directory
- Configure resource handler in WebMvcConfigurer

### 8.4 Image Optimization Plan

**During Upload**:
- Generate thumbnail (200x200 px)
- Generate medium size (800x800 px)
- Keep original
- Store all three versions

**Future CDN Migration**:
- Move files to AWS S3
- Use CloudFront CDN
- Update URLs in database
- Keep same API interface

---

## PART 9: 6-WEEK IMPLEMENTATION TIMELINE

### Week 1: Project Setup & Foundation

**Days 1-2: Project Initialization**
- [ ] Create Spring Boot project with Maven
- [ ] Set up Git repository
- [ ] Configure MySQL database and create schema
- [ ] Set up Redis server
- [ ] Create basic folder structure (frontend + backend)
- [ ] Configure Spring Security (basic setup)

**Days 3-4: User Management & Authentication**
- [ ] Implement user registration endpoint
- [ ] Implement login endpoint with JWT generation
- [ ] Create user tables (accounts, user_info, user_auth, user_tokens)
- [ ] Implement password hashing with BCrypt
- [ ] Build login page (HTML + JavaScript)
- [ ] Test authentication flow

**Days 5-7: Multi-Tenancy & Authorization**
- [ ] Implement account context injection filter
- [ ] Create JWT validation filter
- [ ] Implement token refresh endpoint
- [ ] Build dashboard page shell
- [ ] Implement logout functionality
- [ ] Test multi-tenant data isolation

**Deliverable**: Working authentication system with multi-tenant support

---

### Week 2: Category & Supplier Management

**Days 8-9: Category System**
- [ ] Create categories table with materialized path
- [ ] Implement category CRUD endpoints
- [ ] Build category tree selector UI
- [ ] Implement hierarchical category queries
- [ ] Test category operations

**Days 10-11: Supplier Management**
- [ ] Create suppliers table
- [ ] Implement supplier CRUD endpoints
- [ ] Build supplier management UI
- [ ] Implement supplier search
- [ ] Test supplier operations

**Days 12-14: Foundation Testing**
- [ ] Write unit tests for services
- [ ] Write integration tests for repositories
- [ ] Test multi-tenant isolation
- [ ] Fix bugs and refine UX
- [ ] Code review and documentation

**Deliverable**: Complete category and supplier management

---

### Week 3: Product Management Core

**Days 15-17: Product CRUD**
- [ ] Create products and product_images tables
- [ ] Implement product CRUD endpoints
- [ ] Build product list UI with pagination
- [ ] Build add/edit product form
- [ ] Implement product validation
- [ ] Test product operations

**Days 18-19: Image Upload**
- [ ] Implement image upload endpoint
- [ ] Configure file storage directory
- [ ] Build image uploader UI component
- [ ] Implement image preview and deletion
- [ ] Test image upload flow

**Days 20-21: Product Search**
- [ ] Set up FULLTEXT index on product name
- [ ] Implement search endpoint with filters
- [ ] Build search UI with filter options
- [ ] Implement search result caching
- [ ] Test search performance

**Deliverable**: Complete product management with search

---

### Week 4: Inventory Management

**Days 22-23: Inventory Core**
- [ ] Create inventory and inventory_transactions tables
- [ ] Implement inventory initialization for new products
- [ ] Build inventory overview UI
- [ ] Implement stock level indicators
- [ ] Test inventory display

**Days 24-25: Stock Operations**
- [ ] Implement decrease stock endpoint with pessimistic locking
- [ ] Implement increase stock endpoint
- [ ] Implement stock adjustment endpoint
- [ ] Build stock adjustment UI
- [ ] Test concurrency scenarios

**Days 26-28: Inventory Transactions**
- [ ] Build inventory transaction history UI
- [ ] Implement transaction filtering
- [ ] Add low stock alerts
- [ ] Test transaction recording
- [ ] Performance testing

**Deliverable**: Complete inventory management with concurrency control

---

### Week 5: Caching & Performance

**Days 29-30: Redis Integration**
- [ ] Implement cache-aside for products
- [ ] Implement cache-aside for categories
- [ ] Implement cache-aside for suppliers
- [ ] Set up cache invalidation on updates
- [ ] Test cache hit/miss rates

**Days 31-32: Performance Optimization**
- [ ] Optimize database queries
- [ ] Add missing indexes
- [ ] Implement query result caching
- [ ] Optimize image loading
- [ ] Load testing with JMeter

**Days 33-35: Polish & UX**
- [ ] Improve error messages
- [ ] Add loading indicators
- [ ] Implement success notifications
- [ ] Responsive design improvements
- [ ] Vietnamese language labels

**Deliverable**: Optimized system meeting performance targets

---

### Week 6: Testing & Deployment

**Days 36-37: Testing**
- [ ] Write comprehensive unit tests
- [ ] Write integration tests for all endpoints
- [ ] Test multi-device authentication
- [ ] Test concurrent user scenarios
- [ ] Security testing (SQL injection, XSS, CSRF)

**Days 38-39: Documentation**
- [ ] API documentation
- [ ] Database schema documentation
- [ ] User manual
- [ ] Deployment guide
- [ ] Troubleshooting guide

**Days 40-42: Deployment & Launch**
- [ ] Set up production database
- [ ] Configure production Redis
- [ ] Deploy application to production server
- [ ] Performance monitoring setup
- [ ] Pilot user onboarding
- [ ] Bug fixes and final adjustments

**Deliverable**: Production-ready MVP with documentation

---

## PART 10: RISK MITIGATION STRATEGIES

### 10.1 Technical Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Database performance degradation | High | Medium | Early load testing, proper indexing, query optimization |
| Cross-tenant data leakage | Critical | Low | Comprehensive testing, code reviews, automated tests |
| Inventory concurrency bugs | High | Medium | Pessimistic locking, extensive concurrency testing |
| Redis unavailable | Medium | Low | Graceful degradation to MySQL, health checks |
| Search performance issues | Medium | Medium | Start with MySQL, plan Elasticsearch migration |
| Image upload failures | Low | Medium | Proper validation, error handling, file size limits |

### 10.2 Timeline Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Scope creep | High | High | Strict scope definition, weekly reviews, say NO to features |
| Team member unavailable | Medium | Medium | Knowledge sharing, documentation, pair programming |
| Bug fixing taking too long | Medium | Medium | Allocate 20% buffer time, prioritize critical bugs |
| Integration issues | Medium | Low | Incremental integration, continuous testing |

### 10.3 Business Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| User adoption issues | High | Medium | Simple UX, user training, feedback loop |
| Competitor pressure | Medium | High | Focus on core features, fast delivery |
| Scalability concerns | Medium | Low | Design for scale from day one, modular architecture |

---

## PART 11: SUCCESS CRITERIA & KPIs

### 11.1 Technical Success Metrics

**Performance**:
- [ ] Page load time <2 seconds (95th percentile)
- [ ] Search response time <500ms (95th percentile)
- [ ] API response time <200ms (average)
- [ ] Support 100 concurrent users per tenant
- [ ] Database query time <100ms (average)

**Quality**:
- [ ] Test coverage >80%
- [ ] Zero critical bugs in production
- [ ] Zero data leakage incidents between tenants
- [ ] All security vulnerabilities resolved
- [ ] Code review completed for all features

**Reliability**:
- [ ] System uptime >99% during business hours
- [ ] Zero data loss incidents
- [ ] Successful backup and restore tested
- [ ] Graceful degradation when Redis down

### 11.2 Functional Success Metrics

**User Management**:
- [ ] Users can register and create accounts
- [ ] Multi-device login working correctly
- [ ] Token refresh happens silently
- [ ] Role-based access control functional
- [ ] Password policy enforced

**Product Management**:
- [ ] Create/edit/delete products
- [ ] Upload multiple images per product
- [ ] Organize products by categories
- [ ] Assign suppliers to products
- [ ] Search products with filters
- [ ] Product status workflow (draft/active/inactive)

**Inventory Management**:
- [ ] Track stock levels accurately
- [ ] Prevent overselling (concurrency control works)
- [ ] Record all inventory transactions
- [ ] View transaction history
- [ ] Low stock alerts
- [ ] Manual stock adjustments

**Category Management**:
- [ ] Create hierarchical categories
- [ ] Move categories (change parent)
- [ ] Filter products by category
- [ ] Category tree display

**Supplier Management**:
- [ ] Add/edit/delete suppliers
- [ ] Assign products to suppliers
- [ ] Filter products by supplier

### 11.3 Business Success Metrics

**User Engagement**:
- [ ] 3+ pilot accounts onboarded
- [ ] 500+ products per account (average)
- [ ] 10+ inventory transactions per day per account
- [ ] 80%+ daily active user rate
- [ ] <5% user error rate

**System Utilization**:
- [ ] 100+ products created per week
- [ ] 50+ concurrent users supported
- [ ] 1000+ search queries per day
- [ ] <1% failed transactions

### 11.4 MVP Acceptance Criteria

**Must-Have Features**:
- ✅ User authentication and authorization
- ✅ Multi-tenant data isolation
- ✅ Product CRUD operations
- ✅ Category management
- ✅ Supplier management
- ✅ Inventory tracking
- ✅ Product search with filters
- ✅ Image upload (multiple per product)
- ✅ Inventory concurrency control
- ✅ Transaction history

**Performance Requirements**:
- ✅ <2s page load time
- ✅ <500ms search response
- ✅ 100+ concurrent users per tenant
- ✅ Support 1000+ products per account

**Quality Requirements**:
- ✅ Zero critical security vulnerabilities
- ✅ No cross-tenant data leakage
- ✅ 80%+ test coverage
- ✅ Complete documentation

---

## PART 12: API ENDPOINT SPECIFICATION

### 12.1 Authentication Endpoints

**POST /api/auth/register**
- Purpose: Create new account and admin user
- Request:
  ```json
  {
    "businessName": "My Store",
    "email": "admin@mystore.com",
    "password": "SecurePass123!",
    "phone": "0901234567",
    "fullName": "Nguyen Van A"
  }
  ```
- Response: `201 Created`
  ```json
  {
    "accountId": 123,
    "userId": 456,
    "message": "Account created successfully"
  }
  ```

**POST /api/auth/login**
- Purpose: Authenticate user
- Request:
  ```json
  {
    "email": "admin@mystore.com",
    "password": "SecurePass123!"
  }
  ```
- Response: `200 OK` + Set-Cookie headers
  ```json
  {
    "user": {
      "id": 456,
      "fullName": "Nguyen Van A",
      "email": "admin@mystore.com",
      "role": "admin"
    },
    "account": {
      "id": 123,
      "businessName": "My Store"
    }
  }
  ```

**POST /api/auth/refresh**
- Purpose: Refresh access token
- Request: (refresh token in cookie)
- Response: `200 OK` + Set-Cookie with new access token

**POST /api/auth/logout**
- Purpose: Invalidate refresh token
- Request: (refresh token in cookie)
- Response: `200 OK`

### 12.2 Product Endpoints

**GET /api/products**
- Purpose: List products with pagination and filters
- Query params:
  - `page` (default: 1)
  - `size` (default: 20)
  - `search` (optional)
  - `categoryId` (optional)
  - `supplierId` (optional)
  - `status` (optional: active/inactive/draft)
  - `sortBy` (optional: name/price/createdAt)
  - `sortDir` (optional: asc/desc)
- Response: `200 OK`
  ```json
  {
    "items": [
      {
        "id": 789,
        "sku": "IP15-BLK",
        "name": "iPhone 15 Black",
        "sellingPrice": 24000000,
        "quantity": 10,
        "status": "active",
        "primaryImage": "/uploads/products/123/789/image.jpg",
        "category": {
          "id": 5,
          "name": "Mobile Phones"
        }
      }
    ],
    "totalItems": 150,
    "totalPages": 8,
    "currentPage": 1
  }
  ```

**GET /api/products/{id}**
- Purpose: Get product details
- Response: `200 OK`
  ```json
  {
    "id": 789,
    "sku": "IP15-BLK",
    "barcode": "1234567890123",
    "name": "iPhone 15 Black",
    "description": "Latest iPhone model",
    "costPrice": 20000000,
    "sellingPrice": 24000000,
    "unit": "piece",
    "status": "active",
    "category": {
      "id": 5,
      "name": "Mobile Phones"
    },
    "supplier": {
      "id": 10,
      "name": "Apple Authorized"
    },
    "images": [
      {
        "id": 1,
        "url": "/uploads/products/123/789/front.jpg",
        "isPrimary": true
      },
      {
        "id": 2,
        "url": "/uploads/products/123/789/back.jpg",
        "isPrimary": false
      }
    ],
    "inventory": {
      "quantity": 10,
      "minStockLevel": 5,
      "maxStockLevel": 50
    }
  }
  ```

**POST /api/products**
- Purpose: Create new product
- Request:
  ```json
  {
    "sku": "IP15-BLK",
    "barcode": "1234567890123",
    "name": "iPhone 15 Black",
    "description": "Latest iPhone model",
    "categoryId": 5,
    "supplierId": 10,
    "costPrice": 20000000,
    "sellingPrice": 24000000,
    "unit": "piece",
    "status": "draft",
    "initialStock": 10,
    "minStockLevel": 5
  }
  ```
- Response: `201 Created`
  ```json
  {
    "id": 789,
    "sku": "IP15-BLK",
    "message": "Product created successfully"
  }
  ```

**PUT /api/products/{id}**
- Purpose: Update product
- Request: Same as POST (partial updates allowed)
- Response: `200 OK`

**DELETE /api/products/{id}**
- Purpose: Soft delete product (set status to inactive)
- Response: `204 No Content`

### 12.3 Product Image Endpoints

**POST /api/products/{productId}/images**
- Purpose: Upload product images
- Request: `multipart/form-data` with file(s)
- Response: `201 Created`
  ```json
  {
    "images": [
      {
        "id": 1,
        "url": "/uploads/products/123/789/image.jpg",
        "isPrimary": true
      }
    ]
  }
  ```

**DELETE /api/products/{productId}/images/{imageId}**
- Purpose: Delete product image
- Response: `204 No Content`

**PUT /api/products/{productId}/images/{imageId}/primary**
- Purpose: Set image as primary
- Response: `200 OK`

### 12.4 Category Endpoints

**GET /api/categories**
- Purpose: Get category tree
- Response: `200 OK`
  ```json
  {
    "categories": [
      {
        "id": 1,
        "name": "Electronics",
        "path": "/electronics",
        "level": 0,
        "children": [
          {
            "id": 5,
            "name": "Mobile Phones",
            "path": "/electronics/mobile",
            "level": 1,
            "children": []
          }
        ]
      }
    ]
  }
  ```

**POST /api/categories**
- Purpose: Create category
- Request:
  ```json
  {
    "name": "Laptops",
    "parentId": 1
  }
  ```
- Response: `201 Created`

**PUT /api/categories/{id}**
- Purpose: Update category
- Request:
  ```json
  {
    "name": "Updated Name",
    "parentId": 2
  }
  ```
- Response: `200 OK`

**DELETE /api/categories/{id}**
- Purpose: Delete category (only if no products assigned)
- Response: `204 No Content`

### 12.5 Supplier Endpoints

**GET /api/suppliers**
- Purpose: List suppliers
- Query params:
  - `page` (default: 1)
  - `size` (default: 20)
  - `search` (optional)
- Response: `200 OK`
  ```json
  {
    "items": [
      {
        "id": 10,
        "name": "Apple Authorized",
        "contactPerson": "Tran Van B",
        "phone": "0912345678",
        "email": "contact@apple.vn",
        "status": "active"
      }
    ],
    "totalItems": 25,
    "totalPages": 2,
    "currentPage": 1
  }
  ```

**POST /api/suppliers**
- Purpose: Create supplier
- Request:
  ```json
  {
    "name": "Apple Authorized",
    "contactPerson": "Tran Van B",
    "phone": "0912345678",
    "email": "contact@apple.vn",
    "address": "123 Nguyen Hue, HCMC",
    "taxCode": "0123456789"
  }
  ```
- Response: `201 Created`

**PUT /api/suppliers/{id}**
- Purpose: Update supplier
- Response: `200 OK`

**DELETE /api/suppliers/{id}**
- Purpose: Soft delete supplier
- Response: `204 No Content`

### 12.6 Inventory Endpoints

**GET /api/inventory**
- Purpose: Get inventory overview
- Query params:
  - `page`, `size`, `search`
  - `lowStockOnly` (boolean)
  - `categoryId` (optional)
- Response: `200 OK`
  ```json
  {
    "items": [
      {
        "productId": 789,
        "productName": "iPhone 15 Black",
        "sku": "IP15-BLK",
        "quantity": 10,
        "minStockLevel": 5,
        "maxStockLevel": 50,
        "isLowStock": false,
        "lastRestockDate": "2025-11-01T10:30:00Z"
      }
    ],
    "totalItems": 150,
    "lowStockCount": 12
  }
  ```

**POST /api/inventory/adjust**
- Purpose: Manual stock adjustment
- Request:
  ```json
  {
    "productId": 789,
    "quantity": 5,
    "type": "in",
    "notes": "Received from supplier"
  }
  ```
- Response: `200 OK`
  ```json
  {
    "previousQuantity": 10,
    "newQuantity": 15,
    "transactionId": 1234
  }
  ```

**POST /api/inventory/decrease**
- Purpose: Decrease stock (sale)
- Request:
  ```json
  {
    "productId": 789,
    "quantity": 1
  }
  ```
- Response: `200 OK` or `409 Conflict` (out of stock)

**GET /api/inventory/transactions**
- Purpose: Get transaction history
- Query params:
  - `productId` (optional)
  - `startDate`, `endDate` (optional)
  - `transactionType` (optional: in/out/adjustment)
  - `page`, `size`
- Response: `200 OK`
  ```json
  {
    "items": [
      {
        "id": 1234,
        "productId": 789,
        "productName": "iPhone 15 Black",
        "type": "out",
        "quantity": 1,
        "previousQuantity": 11,
        "newQuantity": 10,
        "notes": "Sale #5678",
        "createdAt": "2025-11-05T14:30:00Z",
        "createdBy": "Nguyen Van A"
      }
    ],
    "totalItems": 500
  }
  ```

---

## PART 13: ERROR HANDLING STRATEGY

### 13.1 HTTP Status Codes

| Code | Usage | Example |
|------|-------|---------|
| 200 OK | Successful GET/PUT | Product retrieved |
| 201 Created | Successful POST | Product created |
| 204 No Content | Successful DELETE | Product deleted |
| 400 Bad Request | Validation error | Invalid email format |
| 401 Unauthorized | Missing/invalid token | Token expired |
| 403 Forbidden | Insufficient permissions | Staff trying admin action |
| 404 Not Found | Resource not found | Product ID doesn't exist |
| 409 Conflict | Business rule violation | Out of stock, duplicate SKU |
| 422 Unprocessable Entity | Semantic error | Negative price |
| 500 Internal Server Error | Server error | Database connection failed |

### 13.2 Error Response Format

**Standard Error Structure**:
```json
{
  "timestamp": "2025-11-05T14:30:00Z",
  "status": 400,
  "error": "Bad Request",
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
  "path": "/api/auth/register"
}
```

### 13.3 Frontend Error Handling

**API Call Pattern**:
```javascript
async function createProduct(productData) {
    try {
        const response = await api.post('/products', productData);
        
        if (response.ok) {
            const data = await response.json();
            showSuccess('Product created successfully');
            return data;
        } else {
            const error = await response.json();
            
            if (response.status === 400) {
                // Validation errors
                showValidationErrors(error.details);
            } else if (response.status === 409) {
                // Business rule violation
                showError(error.message);
            } else {
                // Generic error
                showError('Failed to create product');
            }
        }
    } catch (error) {
        // Network error
        showError('Network error. Please check your connection.');
        console.error(error);
    }
}
```

### 13.4 Common Error Scenarios

**Authentication Errors**:
- Invalid credentials → 401 "Invalid email or password"
- Token expired → 401, trigger silent refresh
- Account locked → 403 "Account is locked due to multiple failed login attempts"

**Validation Errors**:
- Missing required field → 400 "Field {name} is required"
- Invalid format → 400 "{field} format is invalid"
- Value out of range → 400 "{field} must be between {min} and {max}"

**Business Logic Errors**:
- Duplicate SKU → 409 "Product with SKU {sku} already exists"
- Out of stock → 409 "Insufficient stock. Available: {qty}, Requested: {qty}"
- Delete category with products → 409 "Cannot delete category with assigned products"

**Not Found Errors**:
- Product not found → 404 "Product with ID {id} not found"
- Category not found → 404 "Category with ID {id} not found"

---

## PART 14: TESTING STRATEGY

### 14.1 Testing Pyramid

```
         /\
        /E2E\          (10% - End-to-End)
       /------\
      /Integration\    (30% - Integration Tests)
     /------------\
    /  Unit Tests  \   (60% - Unit Tests)
   /----------------\
```

### 14.2 Unit Testing Plan

**What to Test**:
- Service layer business logic
- Utility functions
- Validation logic
- Data transformations

**Tools**:
- JUnit 5
- Mockito (mocking dependencies)
- AssertJ (fluent assertions)

**Example Test Cases**:
- ProductService.createProduct() with valid data
- ProductService.createProduct() with duplicate SKU
- InventoryService.decreaseStock() with sufficient stock
- InventoryService.decreaseStock() with insufficient stock
- PasswordValidator.isValid() with various passwords
- CategoryService.buildCategoryTree() with nested categories

**Target**: 80%+ code coverage

### 14.3 Integration Testing Plan

**What to Test**:
- API endpoints with database
- Repository layer queries
- Multi-tenant data isolation
- Transaction boundaries

**Tools**:
- Spring Boot Test
- TestContainers (MySQL + Redis)
- MockMvc (API testing)

**Example Test Cases**:
- POST /api/products creates product in database
- GET /api/products filters by account_id
- POST /api/inventory/decrease acquires database lock
- Concurrent inventory decrease requests (race condition)
- Token refresh flow end-to-end
- Cross-tenant data access prevented

**Target**: All critical paths covered

### 14.4 Concurrency Testing Plan

**Critical Scenario**: Two users decrease same product stock simultaneously

**Test Setup**:
```java
@Test
void testConcurrentStockDecrease() throws Exception {
    // Given: Product with stock = 1
    Long productId = createProductWithStock(1);
    
    // When: 2 threads try to decrease stock by 1
    ExecutorService executor = Executors.newFixedThreadPool(2);
    
    Callable<Boolean> decreaseTask = () -> {
        try {
            inventoryService.decreaseStock(accountId, productId, 1);
            return true;
        } catch (OutOfStockException e) {
            return false;
        }
    };
    
    Future<Boolean> thread1 = executor.submit(decreaseTask);
    Future<Boolean> thread2 = executor.submit(decreaseTask);
    
    // Then: One succeeds, one fails
    boolean result1 = thread1.get();
    boolean result2 = thread2.get();
    
    assertTrue(result1 != result2); // XOR: exactly one succeeds
    
    // And: Final stock = 0
    int finalStock = inventoryRepository.getStock(productId);
    assertEquals(0, finalStock);
}
```

### 14.5 Security Testing Plan

**SQL Injection Tests**:
- Test search with SQL injection patterns
- Test login with SQL injection
- Verify parameterized queries used everywhere

**XSS Tests**:
- Test product name with script tags
- Verify output encoding in frontend
- Test description field with malicious HTML

**Multi-Tenant Isolation Tests**:
- User from Account A tries to access Account B's products
- Verify all queries include account_id filter
- Test API endpoints with manipulated accountId in token

**Authentication Tests**:
- Access protected endpoint without token
- Access with expired token
- Access with modified token (tampered signature)

### 14.6 Performance Testing Plan

**Load Testing with JMeter**:
- Simulate 100 concurrent users
- Each user: login → search products → view product details → logout
- Duration: 10 minutes
- Monitor: response times, error rate, database connections

**Performance Targets**:
- Average response time: <200ms
- 95th percentile: <500ms (search), <2s (page load)
- Error rate: <1%
- Database connection pool: no exhaustion

**Scenarios**:
1. Product search: 50 requests/second
2. Product details: 30 requests/second
3. Inventory decrease: 20 requests/second
4. Product create: 5 requests/second

### 14.7 User Acceptance Testing Plan

**Test Accounts**:
- Create 3 test accounts with different roles
- Account 1: Admin user (full access)
- Account 2: Manager user (read/write products, inventory)
- Account 3: Staff user (read-only)

**Test Scenarios**:
1. Complete product lifecycle (create → edit → delete)
2. Upload and manage product images
3. Organize products into categories
4. Perform inventory adjustments
5. Search and filter products
6. Concurrent stock decrease from multiple browsers
7. Multi-device login and token refresh

**Acceptance Criteria**:
- All features work as specified
- UI is intuitive and responsive
- No confusing error messages
- Performance meets targets
- Vietnamese text displays correctly

---

## PART 15: DEPLOYMENT PLAN

### 15.1 Localhost Development Setup

**Prerequisites**:
- JDK 17 installed
- MySQL 8.0 installed and running
- Redis 7.0 installed and running
- Maven 3.9 installed

**Step-by-Step Setup**:
1. Clone repository
2. Create MySQL database: `kiotviet_mvp`
3. Configure `application.properties` with database credentials
4. Run database migrations
5. Start Redis server: `redis-server`
6. Build Spring Boot app: `mvn clean install`
7. Run application: `mvn spring-boot:run`
8. Access frontend: `http://localhost:8080`

### 15.2 Configuration Management

**Environment-Specific Properties**:

**application-dev.properties** (Development):
```properties
server.port=8080
spring.datasource.url=jdbc:mysql://localhost:3306/kiotviet_mvp
spring.redis.host=localhost
logging.level.com.kiotviet=DEBUG
```

**application-prod.properties** (Production):
```properties
server.port=8080
spring.datasource.url=${DB_URL}
spring.datasource.username=${DB_USERNAME}
spring.datasource.password=${DB_PASSWORD}
spring.redis.host=${REDIS_HOST}
spring.redis.password=${REDIS_PASSWORD}
logging.level.com.kiotviet=INFO
```

**Secrets Management**:
- Use environment variables for sensitive data
- Never commit credentials to Git
- Use `.env` file for local development (add to `.gitignore`)

### 15.3 Database Migration Strategy

**Tool**: Flyway

**Migration Files**:
```
src/main/resources/db/migration/
├── V1__create_user_tables.sql
├── V2__create_product_tables.sql
├── V3__create_inventory_tables.sql
├── V4__create_indexes.sql
├── V5__seed_initial_data.sql
```

**Migration Process**:
1. Flyway checks database version
2. Applies pending migrations in order
3. Records version in `flyway_schema_history` table
4. Fails if migration error (manual intervention required)

**Rollback Strategy**:
- Create rollback scripts for each migration
- Test rollback in staging before production
- Keep database backups before migrations

### 15.4 Production Deployment Checklist

**Pre-Deployment**:
- [ ] All tests passing (unit, integration, E2E)
- [ ] Code review completed
- [ ] Performance testing done
- [ ] Security scan completed
- [ ] Database backup created
- [ ] Rollback plan documented

**Deployment Steps**:
1. Notify users of maintenance window
2. Stop application server
3. Backup database
4. Run database migrations
5. Deploy new application version
6. Start application server
7. Verify health checks
8. Smoke test critical features
9. Monitor error logs for 1 hour

**Post-Deployment**:
- [ ] All critical features working
- [ ] Performance metrics normal
- [ ] No error spikes in logs
- [ ] User feedback collected
- [ ] Update documentation

### 15.5 Monitoring & Alerting Plan

**Application Metrics** (Spring Boot Actuator):
- `/actuator/health` - Application health status
- `/actuator/metrics` - Performance metrics
- `/actuator/info` - Application information

**Key Metrics to Monitor**:
- Request rate (requests/second)
- Response times (average, 95th percentile)
- Error rate (%)
- Database connection pool usage
- Redis cache hit rate
- JVM memory usage
- CPU usage

**Alerting Rules**:
- Error rate >5% for 5 minutes → Alert
- Average response time >1 second for 10 minutes → Alert
- Database connection pool >90% → Alert
- Application down → Immediate alert

**Logging Strategy**:
- Use SLF4J with Logback
- Log levels: ERROR (critical issues), WARN (potential issues), INFO (important events), DEBUG (development only)
- Log format: timestamp, level, thread, logger, message
- Rotate logs daily, keep 30 days

---

## PART 16: POST-MVP ROADMAP

### 16.1 Phase 1 Enhancements (Weeks 7-10)

**Product Variants**:
- Add product attributes (size, color, material)
- Support product variants (SKU per variant)
- Variant-specific pricing and stock

**Advanced Search**:
- Autocomplete suggestions
- Search by multiple fields
- Save search filters
- Recent searches

**Bulk Operations**:
- Bulk product import (CSV/Excel)
- Bulk price updates
- Bulk category assignment
- Bulk image upload

**Reporting**:
- Sales report by product
- Inventory valuation report
- Low stock report
- Supplier performance report

### 16.2 Phase 2: Multi-Store Support (Weeks 11-16)

**Architecture Changes**:
- Add `stores` table
- Change inventory to track per store
- Inter-store transfers
- Store-level reporting

**Features**:
- Manage multiple store locations
- Transfer stock between stores
- Store-specific pricing
- Consolidated inventory view

### 16.3 Phase 3: POS Integration (Weeks 17-24)

**POS System**:
- Sales transaction processing
- Receipt printing
- Payment methods (cash, card, e-wallet)
- Customer management
- Sales reports

**Integration**:
- Real-time inventory sync
- Automatic stock decrease on sale
- Sales data in reporting
- Customer purchase history

### 16.4 Technical Improvements

**Elasticsearch Migration**:
- Set up Elasticsearch cluster
- Implement Vietnamese analyzer
- Sync products to Elasticsearch
- Advanced search features (fuzzy, autocomplete)

**Microservices Transition**:
- Split into services: User, Product, Inventory, Sales
- API Gateway with authentication
- Event-driven architecture (Kafka/RabbitMQ)
- Service discovery

**Cloud Deployment**:
- Migrate to AWS/GCP
- Use managed MySQL (RDS/Cloud SQL)
- Use managed Redis (ElastiCache/Memorystore)
- CDN for static assets and images
- Auto-scaling for high traffic

---

## PART 17: APPENDICES

### Appendix A: Key Dependencies (pom.xml)

```xml
<dependencies>
    <!-- Spring Boot Starters -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-jpa</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-security</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-data-redis</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-validation</artifactId>
    </dependency>
    
    <!-- Database -->
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
        <version>8.0.33</version>
    </dependency>
    <dependency>
        <groupId>org.flywaydb</groupId>
        <artifactId>flyway-mysql</artifactId>
    </dependency>
    
    <!-- JWT -->
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-api</artifactId>
        <version>0.12.3</version>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-impl</artifactId>
        <version>0.12.3</version>
        <scope>runtime</scope>
    </dependency>
    <dependency>
        <groupId>io.jsonwebtoken</groupId>
        <artifactId>jjwt-jackson</artifactId>
        <version>0.12.3</version>
        <scope>runtime</scope>
    </dependency>
    
    <!-- Utilities -->
    <dependency>
        <groupId>org.projectlombok</groupId>
        <artifactId>lombok</artifactId>
        <optional>true</optional>
    </dependency>
    
    <!-- Testing -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-test</artifactId>
        <scope>test</scope>
    </dependency>
    <dependency>
        <groupId>org.springframework.security</groupId>
        <artifactId>spring-security-test</artifactId>
        <scope>test</scope>
    </dependency>
</dependencies>
```

### Appendix B: Project Folder Structure

```
kiotviet-mvp/
├── src/
│   ├── main/
│   │   ├── java/com/kiotviet/
│   │   │   ├── config/
│   │   │   │   ├── SecurityConfig.java
│   │   │   │   ├── RedisConfig.java
│   │   │   │   └── WebMvcConfig.java
│   │   │   ├── controller/
│   │   │   │   ├── AuthController.java
│   │   │   │   ├── ProductController.java
│   │   │   │   ├── CategoryController.java
│   │   │   │   ├── SupplierController.java
│   │   │   │   └── InventoryController.java
│   │   │