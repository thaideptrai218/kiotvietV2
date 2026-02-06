# KiotvietV2 - Code Standards

**Version**: 1.0
**Date**: February 6, 2026
**Applies To**: All Java, HTML, CSS, JavaScript code

---

## Overview

This document establishes coding standards and conventions for the KiotvietV2 project to ensure code quality, maintainability, and consistency.

**Core Principles**:
- Domain-First Architecture: Code organized by business domain
- SOLID Principles: Single responsibility, dependency injection, open/closed
- Clean Code: Readable, testable, and maintainable
- YAGNI/KISS/DRY: Keep it simple, don't repeat yourself

---

## General Principles

### Core Values

1. **Readability Over Conciseness**: Code should be easy to understand
2. **Testability First**: Design code to be easily testable
3. **Consistency**: Follow patterns consistently across the codebase
4. **Documentation**: Document complex business logic

### Anti-Patterns to Avoid

- Use magic numbers without constants
- Don't create God classes with 1000+ lines
- Don't ignore compilation errors
- Don't use single-letter variable names in production code

---

## Java Code Standards

### Package Structure

Organize code by business domain, not technical layer:

```
fa.academy.kiotviet/
├── application/          # Controllers, DTOs, Application Services
├── core/                 # Domain entities, business logic
│   ├── usermanagement/   # Business domain: User management
│   ├── productcatalog/   # Business domain: Product catalog
│   ├── inventory/        # Business domain: Inventory
│   └── ...
├── infrastructure/       # Technology implementations
└── config/               # Spring configuration
```

**When to use each package**:
- `domain/{feature}/`: Business domain logic
- `application/`: Application services, DTOs
- `infrastructure/`: External integrations
- `config/`: Spring configuration

### Dependency Injection

Use constructor injection with `@RequiredArgsConstructor`:

```java
// ✅ CORRECT
@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
}

// ❌ WRONG
@Service
public class ProductService {
    @Autowired
    private ProductRepository productRepository;
}
```

### Service Layer Pattern

Encapsulate business logic in service classes:

```java
@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepository categoryRepository;

    @Transactional
    public CategoryDTO moveCategory(Long categoryId, Long newParentId, Long accountId) {
        // 1. Validate input
        // 2. Fetch entity
        // 3. Validate account isolation
        // 4. Business logic
        // 5. Update and save
        // 6. Invalidate caches
        // 7. Convert to DTO
        return convertToDTO(updated);
    }
}
```

**Guidelines**:
- Use `@Transactional` for data modification methods
- Perform validation before business logic
- Check account isolation before operations
- Convert to DTO before returning
- Keep methods focused (one responsibility)

### Repository Pattern

Define repository interfaces, let Spring Data JPA implement:

```java
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByAccountId(Long accountId);
    Page<Product> findByAccountIdAndStatus(Long accountId, ProductStatus status, Pageable pageable);
    Optional<Product> findBySku(String sku);
    boolean existsBySkuAndAccountId(String sku, Long accountId);
}
```

**Guidelines**:
- Extend `JpaRepository<Entity, ID>`
- Use Spring Data query methods (findBy...)
- Use `@Query` for complex queries
- Use `Optional` for single result queries

### Entity Standards

Keep entities lean, business logic in services:

```java
@Entity
@Table(name = "products")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long accountId;

    @Column(unique = true, nullable = false)
    private String sku;

    @Column(nullable = false, length = 255)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private Category category;

    @Enumerated(EnumType.STRING)
    private ProductStatus status = ProductStatus.DRAFT;

    @CreatedDate
    private LocalDateTime createdAt;
}
```

**Guidelines**:
- Use Lombok annotations (`@Data`, `@Builder`, `@NoArgsConstructor`)
- Use `nullable = false` for required fields
- Use `@CreatedDate` and `@LastModifiedDate` for audit fields
- Use `FetchType.LAZY` for relationships
- Avoid business logic in entities

### DTO Standards

Separate DTOs from entities for API communication:

```java
// Form DTO (for HTML forms)
@Data
@Builder
public class ProductForm {
    @NotBlank(message = "SKU is required")
    private String sku;

    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Category is required")
    private Long categoryId;
}

// Response DTO (for API responses)
@Data
@Builder
public class ProductDTO {
    private Long id;
    private String sku;
    private String name;
    private BigDecimal costPrice;
    private BigDecimal sellingPrice;
    private Integer currentStock;
}
```

**Guidelines**:
- Use `@NotNull`, `@NotBlank`, `@Pattern` for validation
- Don't expose internal fields (accountId, createdAt)
- Use `@Builder` for immutable objects

### Exception Handling

Use custom exceptions with global exception handler:

```java
public class ProductNotFoundException extends BaseException {
    public ProductNotFoundException(Long id) {
        super("Product with id " + id + " not found", 404);
    }
}

@ControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(BaseException.class)
    public ResponseEntity<ErrorResponse> handleBaseException(BaseException ex) {
        ErrorResponse error = ErrorResponse.builder()
            .code(ex.getCode())
            .message(ex.getMessage())
            .timestamp(new Date())
            .build();
        return ResponseEntity.status(ex.getCode()).body(error);
    }
}
```

---

## Database Standards

### Table Design Principles

1. **Multi-Tenancy**: Every table has `account_id`
2. **Audit Fields**: `created_at`, `updated_at` (no deleted_at for MVP)
3. **Soft Delete**: Use `status` field instead of actual deletion
4. **Index Strategy**: Composite indexes on frequently queried combinations
5. **Constraints**: Foreign keys for referential integrity

### Database Table Example

```sql
CREATE TABLE products (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    account_id BIGINT NOT NULL,
    sku VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
    UNIQUE KEY uk_account_sku (account_id, sku),
    INDEX idx_account_status (account_id, status)
);
```

### Query Optimization

Use proper indexing:

```sql
-- ✅ CORRECT: Optimized query with proper indexing
SELECT id, name, selling_price
FROM products
WHERE account_id = 123
  AND status = 'ACTIVE'
ORDER BY name ASC
LIMIT 20 OFFSET 0;

-- ❌ WRONG: Missing indexes
SELECT * FROM products
WHERE account_id = 123;
```

---

## Frontend Code Standards

### HTML Structure

Use semantic HTML with clear hierarchy:

```html
<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <title>KiotvietV2 - Product Management</title>
    <link rel="stylesheet" href="/css/components.css">
</head>
<body>
    <div th:replace="~{modules/common/dashboard-header :: header}"></div>

    <main class="main-content">
        <div class="container">
            <div class="page-header">
                <h1>Product Management</h1>
            </div>

            <div class="content-wrapper">
                <div class="data-table-container">
                    <table class="data-table">
                        <!-- Table content -->
                    </table>
                </div>
            </div>
        </div>
    </main>

    <script src="/js/modules/product.js"></script>
</body>
</html>
```

**Guidelines**:
- Use semantic HTML5 elements (`<main>`, `<header>`, `<section>`)
- Include viewport meta tag for responsive design
- Use Thymeleaf fragments for reusable components
- Use kebab-case for class names

### CSS Organization

Use BEM naming convention with scoped modules:

```css
.data-table-container {
    overflow-x: auto;
    border: 1px solid #e0e0e0;
}

.data-table {
    width: 100%;
    border-collapse: collapse;
}

.data-table th {
    background-color: #f5f5f5;
    font-weight: 600;
}

/* Product module */
.product-table__row {
    display: table-row;
}

.product-table__row--active {
    background-color: #e8f5e9;
}
```

**Guidelines**:
- Use BEM naming (Block__Element--Modifier)
- Scope CSS to specific components
- Use CSS custom properties for theming
- Keep CSS files under 200 lines
- Mobile-first responsive design

### JavaScript Organization

Use module pattern with clear separation of concerns:

```javascript
class ProductModule {
    constructor(container) {
        this.container = container;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadInitialData();
    }

    async loadProducts(page) {
        showLoading();
        try {
            const response = await fetch(`/api/products?page=${page}`);
            const data = await response.json();
            this.renderProducts(data.items);
        } catch (error) {
            showError('Network error: ' + error.message);
        } finally {
            hideLoading();
        }
    }

    renderProducts(products) {
        const tbody = this.container.querySelector('.product-table__body');
        tbody.innerHTML = products.map(product => `
            <tr class="product-table__row">
                <td>${product.sku}</td>
                <td>${product.name}</td>
            </tr>
        `).join('');
    }
}

// Auto-initialization
document.addEventListener('DOMContentLoaded', () => {
    const productContainer = document.querySelector('[data-module="product"]');
    if (productContainer) {
        new ProductModule(productContainer);
    }
});
```

**Guidelines**:
- Use ES6 modules
- Use class-based architecture for components
- Use `async/await` for API calls
- Use `document.addEventListener('DOMContentLoaded')` for initialization
- Add JSDoc comments for public methods

---

## Testing Standards

### Unit Testing

Test business logic in services with mocks:

```java
@SpringBootTest
class CategoryServiceTest {
    @Autowired
    private CategoryService categoryService;

    @MockBean
    private CategoryRepository categoryRepository;

    @Test
    void moveCategory_ShouldUpdatePath_WhenParentValid() {
        // Given
        Long categoryId = 1L;
        Long newParentId = 2L;
        Long accountId = 100L;

        given(categoryRepository.findById(categoryId))
            .willReturn(Optional.of(createCategory(accountId)));

        // When
        CategoryDTO result = categoryService.moveCategory(categoryId, newParentId, accountId);

        // Then
        assertEquals("/electronics", result.getPath());
    }
}
```

**Guidelines**:
- Test at the service layer
- Use mocks for dependencies
- Test both happy path and edge cases
- Test error conditions
- Aim for 80%+ code coverage

### Integration Testing

Test API endpoints with real database:

```java
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
class ProductApiControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ProductRepository productRepository;

    @Test
    void createProduct_ShouldCreateProduct_WhenValidData() throws Exception {
        // Given
        ProductForm form = createValidProductForm();

        // When/Then
        mockMvc.perform(post("/api/products")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(form)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.sku").value(form.getSku()));
    }
}
```

**Guidelines**:
- Test API endpoints
- Use `@SpringBootTest` with test database
- Use `@AutoConfigureMockMvc` for testing controllers
- Use `@Transactional` for clean state between tests
- Test both success and error cases

---

## Naming Conventions

### Java

| Type | Convention | Example |
|------|------------|---------|
| Package | lowercase | `com.example.usermanagement` |
| Class | PascalCase | `ProductService`, `ProductRepository` |
| Interface | PascalCase | `ProductRepository`, `Service` |
| Method | camelCase | `createProduct()`, `findById()` |
| Variable | camelCase | `productRepository`, `productName` |
| Constant | UPPER_SNAKE_CASE | `MAX_RETRY_ATTEMPTS`, `DEFAULT_PAGE_SIZE` |

### Database

| Type | Convention | Example |
|------|------------|---------|
| Table | snake_case | `products`, `user_tokens` |
| Column | snake_case | `product_name`, `created_at` |
| Index | snake_case | `idx_product_name`, `uk_product_sku` |
| Migration | V{number}__{description} | `V1__create_user_tables.sql` |

### Frontend

| Type | Convention | Example |
|------|------------|---------|
| File | kebab-case | `product-management.js` |
| Class | PascalCase | `ProductModule`, `CategoryTree` |
| Method | camelCase | `loadProducts()`, `renderTree()` |
| Variable | camelCase | `products`, `currentCategory` |
| Constant | UPPER_SNAKE_CASE | `API_BASE_URL`, `DEFAULT_PAGE_SIZE` |

---

## Code Organization

### Project Structure

```
src/main/java/fa/academy/kiotviet/
├── application/
│   ├── controller/          # REST API controllers
│   ├── dto/                 # Data Transfer Objects
│   └── service/             # Application services
├── core/
│   ├── [domain1]/           # Business domain
│   │   ├── entity/
│   │   ├── repository/
│   │   ├── service/
│   │   └── exception/
│   └── ...
├── infrastructure/
│   ├── persistence/
│   ├── security/
│   └── storage/
└── config/
```

### File Size Limits

**Rule**: Keep individual files under 200 lines

**When to split**:
- Service class exceeds 200 lines → Extract private methods
- Controller exceeds 200 lines → Extract request handlers
- DTO exceeds 200 lines → Split into smaller DTOs

---

## Best Practices

### 1. Use Meaningful Names

```java
// ✅ CORRECT
public List<Product> findActiveProductsByCategory(Long categoryId) {
    return productRepository.findByCategoryIdAndStatus(categoryId, ProductStatus.ACTIVE);
}

// ❌ WRONG
public List<Product> getActive(Long categoryId) {
    return productRepository.findByCategoryIdAndStatus(categoryId, ProductStatus.ACTIVE);
}
```

### 2. Avoid Magic Numbers

```java
// ✅ CORRECT
public static final int PAGE_SIZE = 20;
if (attempt >= MAX_RETRY_ATTEMPTS) {
    throw new MaximumAttemptsExceededException();
}

// ❌ WRONG
if (attempt >= 3) {
    throw new MaximumAttemptsExceededException();
}
```

### 3. Validate Input Early

```java
public ProductDTO createProduct(ProductForm form, Long accountId) {
    // 1. Validate input
    if (form == null) {
        throw new BadRequestException("Product form is required");
    }

    // 2. Validate business rules
    validateProductForm(form);
    validateAccountAccess(accountId);

    // 3. Business logic
    // ... rest of implementation
}
```

### 4. Use Try-With-Resources

```java
public void exportProducts(List<Long> productIds, Long accountId) throws IOException {
    try (BufferedWriter writer = Files.newBufferedWriter(Paths.get("products.csv"))) {
        writer.write("ID,SKU,Name,Price\n");

        for (Long productId : productIds) {
            Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ProductNotFoundException(productId));

            writer.write(String.format("%d,%s,%s,%.2f\n",
                product.getId(),
                product.getSku(),
                product.getName(),
                product.getSellingPrice()));
        }
    }
}
```

### 5. Handle Exceptions Gracefully

```java
public ProductDTO getProduct(Long productId, Long accountId) {
    try {
        Product product = productRepository.findById(productId)
            .orElseThrow(() -> new ProductNotFoundException(productId));

        // Account isolation check
        if (!product.getAccountId().equals(accountId)) {
            throw new ForbiddenException("Access to this product is forbidden");
        }

        return convertToDTO(product);
    } catch (DataAccessException e) {
        log.error("Database error while fetching product: {}", productId, e);
        throw new BaseException("Failed to fetch product", 500);
    }
}
```

---

## Review Checklist

Before committing code:
- [ ] Code follows naming conventions
- [ ] File size is under 200 lines (split if larger)
- [ ] All imports are necessary and properly organized
- [ ] No TODO comments without resolution
- [ ] No commented-out code
- [ ] No debug logging in production code
- [ ] Uses `@RequiredArgsConstructor` instead of `@Autowired`
- [ ] Exception handling is comprehensive
- [ ] Input validation is present
- [ ] Account isolation is checked
- [ ] Transaction boundaries are correct
- [ ] DTOs are used for API communication
- [ ] Tests are written for new code
- [ ] Code is readable and self-explanatory

---

**Last Updated**: February 6, 2026
**Maintained By**: Technical Documentation Specialist
