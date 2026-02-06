# Java Code Standards

**Version**: 1.0
**Date**: February 6, 2026

---

## Package Structure

**Rule**: Organize code by business domain, not technical layer

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

| Package | Purpose | Examples |
|---------|---------|----------|
| `domain/{feature}/` | Business domain logic | `usermanagement/`, `productcatalog/` |
| `application/` | Application services, DTOs | `service/`, `dto/` |
| `infrastructure/` | External integrations | `persistence/`, `security/` |
| `config/` | Spring configuration | `GlobalExceptionHandler.java` |

---

## Dependency Injection

**Rule**: Use constructor injection with `@RequiredArgsConstructor`

```java
// ✅ CORRECT
@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
}

// ❌ WRONG
@Service
public class ProductService {
    @Autowired
    private ProductRepository productRepository;
}
```

**Benefits**:
- Immutability (final fields)
- Testability (easily create instances with mocks)
- Compile-time safety (missing dependencies caught early)
- Clean code (no annotation clutter)

---

## Service Layer Pattern

**Rule**: Encapsulate business logic in service classes

```java
@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryRepository categoryRepository;

    @Transactional
    public CategoryDTO moveCategory(Long categoryId, Long newParentId, Long accountId) {
        // 1. Validate input
        if (categoryId == null || newParentId == null) {
            throw new BadRequestException("Category ID and parent ID are required");
        }

        // 2. Fetch entity
        Category category = categoryRepository.findById(categoryId)
            .orElseThrow(() -> new CategoryNotFoundException(categoryId));

        // 3. Validate account isolation
        if (!category.getAccountId().equals(accountId)) {
            throw new ForbiddenException("Access to this category is forbidden");
        }

        // 4. Business logic
        Category newParent = categoryRepository.findById(newParentId)
            .orElseThrow(() -> new CategoryNotFoundException(newParentId));
        category.setParentId(newParentId);
        category.setPath(calculateNewPath(category, newParentId));

        // 5. Update and save
        Category updated = categoryRepository.save(category);

        // 6. Cascade invalidation
        invalidateCategoryCache(categoryId);

        // 7. Convert to DTO
        return convertToDTO(updated);
    }
}
```

**Guidelines**:
- Use `@Transactional` for methods that modify data
- Perform validation before business logic
- Check account isolation before operations
- Convert to DTO before returning
- Invalidate caches after data changes
- Keep methods focused (one responsibility)

---

## Repository Pattern

**Rule**: Define repository interfaces, let Spring Data JPA implement

```java
// ✅ CORRECT
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByAccountId(Long accountId);
    Page<Product> findByAccountIdAndStatus(Long accountId, ProductStatus status, Pageable pageable);
    Optional<Product> findBySku(String sku);
    boolean existsBySkuAndAccountId(String sku, Long accountId);

    @Query("SELECT p FROM Product p WHERE p.accountId = :accountId " +
           "AND (:search IS NULL OR p.name LIKE %:search%)")
    Page<Product> searchProducts(@Param("accountId") Long accountId,
                                 @Param("search") String search,
                                 Pageable pageable);
}
```

**Guidelines**:
- Extend `JpaRepository<Entity, ID>`
- Use Spring Data query methods (findBy...)
- Use `@Query` for complex queries
- Use `Optional` for single result queries
- Return `List`, `Set`, or `Page` for multiple results

---

## Entity Standards

**Rule**: Keep entities lean, business logic in services

```java
// ✅ CORRECT
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

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
```

**Guidelines**:
- Use Lombok annotations (`@Data`, `@Builder`, `@NoArgsConstructor`, `@AllArgsConstructor`)
- Map interfaces to database tables with `@Entity`
- Use `nullable = false` for required fields
- Use `@Enumerated(EnumType.STRING)` for enums
- Use `@CreatedDate` and `@LastModifiedDate` for audit fields
- Use `FetchType.LAZY` for many-to-one relationships
- Avoid business logic in entities

---

## DTO Standards

**Rule**: Separate DTOs from entities for API communication

```java
// Form DTO (for HTML forms)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductForm {
    @NotBlank(message = "SKU is required")
    @Pattern(regexp = "^[A-Z0-9-]+$", message = "SKU must be uppercase letters, numbers, and hyphens only")
    private String sku;

    @NotBlank(message = "Name is required")
    private String name;

    @NotNull(message = "Category is required")
    private Long categoryId;

    private BigDecimal costPrice;
    private BigDecimal sellingPrice;

    private String unit;

    private Long supplierId;
}

// Response DTO (for API responses)
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductDTO {
    private Long id;
    private String sku;
    private String name;
    private BigDecimal costPrice;
    private BigDecimal sellingPrice;
    private String unit;
    private ProductStatus status;

    @JsonManagedReference
    private CategoryDTO category;

    private Integer currentStock;

    private LocalDateTime createdAt;
}
```

**Guidelines**:
- Use `@NotNull`, `@NotBlank`, `@Pattern` for validation
- Use `@DecimalMin` for currency validation
- Use `@JsonManagedReference`/`@JsonBackReference` for bidirectional relationships
- Don't expose internal fields (like `id`, `accountId`, `createdAt`)
- Use `@Builder` for immutable objects

---

## Exception Handling

**Rule**: Use custom exceptions with global exception handler

```java
// Custom exceptions
public class BaseException extends RuntimeException {
    private final int code;

    public BaseException(String message, int code) {
        super(message);
        this.code = code;
    }

    public int getCode() {
        return code;
    }
}

public class ProductNotFoundException extends BaseException {
    public ProductNotFoundException(Long id) {
        super("Product with id " + id + " not found", 404);
    }
}

public class ProductAlreadyExistsException extends BaseException {
    public ProductAlreadyExistsException(String sku) {
        super("Product with SKU " + sku + " already exists", 409);
    }
}

// Global exception handler
@ControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BaseException.class)
    public ResponseEntity<ErrorResponse> handleBaseException(BaseException ex, HttpServletRequest request) {
        ErrorResponse error = ErrorResponse.builder()
            .code(ex.getCode())
            .message(ex.getMessage())
            .path(request.getRequestURI())
            .timestamp(new Date())
            .build();

        return ResponseEntity.status(ex.getCode()).body(error);
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(
            MethodArgumentNotValidException ex, HttpServletRequest request) {

        List<ValidationError> validationErrors = ex.getBindingResult()
            .getFieldErrors()
            .stream()
            .map(error -> ValidationError.builder()
                .field(error.getField())
                .message(error.getDefaultMessage())
                .build())
            .collect(Collectors.toList());

        ErrorResponse error = ErrorResponse.builder()
            .code(400)
            .message("Validation failed")
            .details(validationErrors)
            .path(request.getRequestURI())
            .timestamp(new Date())
            .build();

        return ResponseEntity.badRequest().body(error);
    }
}
```

**Guidelines**:
- Create custom exceptions for each error type
- Use standard HTTP status codes
- Include detailed error messages
- Return consistent error response format
- Use `@ControllerAdvice` for centralized handling

---

**Last Updated**: February 6, 2026
**Maintained By**: Technical Documentation Specialist
