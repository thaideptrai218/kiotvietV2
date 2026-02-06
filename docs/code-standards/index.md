# KiotvietV2 - Code Standards

**Version**: 1.0
**Date**: February 6, 2026
**Applies To**: All Java, HTML, CSS, JavaScript code

---

## Overview

This documentation establishes coding standards and conventions for the KiotvietV2 project to ensure code quality, maintainability, and consistency across the codebase.

**Core Principles**:
- **Domain-First Architecture**: Code organized by business domain
- **SOLID Principles**: Single responsibility, dependency injection, open/closed
- **Clean Code**: Readable, testable, and maintainable
- **YAGNI/KISS/DRY**: You Aren't Gonna Need It, Keep It Simple, Don't Repeat Yourself

---

## Table of Contents

- [General Principles](./general-principles.md)
- [Java Code Standards](./java-standards.md)
- [Database Standards](./database-standards.md)
- [Frontend Code Standards](./frontend-standards.md)
- [Testing Standards](./testing-standards.md)
- [Naming Conventions](./naming-conventions.md)
- [Code Organization](./code-organization.md)
- [Best Practices](./best-practices.md)

---

## Quick Start

### Code Review Checklist

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
- [ ] Javadoc comments for public APIs

### Key Files

- **[General Principles](./general-principles.md)** - Core values and anti-patterns
- **[Java Code Standards](./java-standards.md)** - Package structure, DI, services, repositories
- **[Database Standards](./database-standards.md)** - Schema design, migrations, optimization
- **[Frontend Standards](./frontend-standards.md)** - HTML, CSS, JavaScript patterns
- **[Testing Standards](./testing-standards.md)** - Unit, integration, performance tests
- **[Naming Conventions](./naming-conventions.md)** - Java, database, frontend naming rules
- **[Code Organization](./code-organization.md)** - File structure and size limits
- **[Best Practices](./best-practices.md)** - Common patterns and recommendations

---

**Last Updated**: February 6, 2026
**Maintained By**: Technical Documentation Specialist
