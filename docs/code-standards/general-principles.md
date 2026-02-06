# General Principles

**Version**: 1.0
**Date**: February 6, 2026

---

## Core Values

### 1. Readability Over Conciseness

- Code should be easy to understand for other developers
- Avoid clever one-liners that sacrifice clarity
- Use descriptive names for variables and methods

### 2. Testability First

- Design code to be easily testable
- Avoid static methods and global state
- Use dependency injection for external dependencies

### 3. Consistency

- Follow patterns consistently across the codebase
- Use the same style across similar code
- Avoid mixing different conventions in one file

### 4. Documentation

- Document complex business logic
- Include Javadoc comments for public APIs
- Explain "why" not just "what"

---

## Anti-Patterns to Avoid

- **Don't** use magic numbers without constants
- **Don't** create God classes with 1000+ lines
- **Don't** ignore compilation errors
- **Don't** use single-letter variable names in production code
- **Don't** write code without understanding the business requirement
- **Don't** commit code you haven't tested

---

## Documentation Guidelines

### When to Document

- Document complex business logic
- Document edge cases and corner scenarios
- Document public API methods with parameters and return values
- Document non-obvious design decisions

### What to Document

- **Why**: Explain the reasoning behind design choices
- **How**: Describe implementation details
- **What**: Brief summary for simple, self-explanatory code
- **Exceptions**: Special cases and error handling

### Javadoc Format

```java
/**
 * Creates a new product with comprehensive validation and business logic.
 *
 * <p>This method performs the following steps:
 * <ol>
 *   <li>Validates the input form and account ID</li>
 *   <li>Validates account access (isolation check)</li>
 *   <li>Fetches and validates category and supplier</li>
 *   <li>Validates SKU uniqueness within the account</li>
 *   <li>Creates product entity with default values</li>
 *   <li>Saves the product to database</li>
 *   <li>Invalidates related cache entries</li>
 *   <li>Converts entity to DTO and returns</li>
 * </ol>
 *
 * @param form the product form with product data
 * @param accountId the account ID of the user creating the product
 * @return the created product DTO
 * @throws BadRequestException if form or accountId is invalid
 * @throws ForbiddenException if account isolation check fails
 * @throws CategoryNotFoundException if category doesn't exist
 * @throws ProductAlreadyExistsException if SKU already exists
 */
public ProductDTO createProduct(ProductForm form, Long accountId) {
    // Implementation
}
```

**Note**: Keep Javadoc concise. Use concise language and avoid unnecessary fluff.

---

**Last Updated**: February 6, 2026
**Maintained By**: Technical Documentation Specialist
