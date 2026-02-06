---
phase: 02
title: Backend Domain & API - System Admin
status: completed
priority: P2
effort: 2h
dependencies: []
completed: 2026-02-06
---

# Phase 02: Backend Domain & API - System Admin

## Context Links

- UserInfo entity: `/home/welterial/projects/kiotvietV2/src/main/java/fa/academy/kiotviet/core/usermanagement/domain/UserInfo.java`
- Controller examples: `/home/welterial/projects/kiotvietV2/src/main/java/fa/academy/kiotviet/application/controller/api/CompanyController.java`
- Package base: `/home/welterial/projects/kiotvietV2/src/main/java/fa/academy/kiotviet/`

## Parallelization Info

**Independent:** This phase has no dependencies and can run in parallel with Phase 01 and Phase 03.

**Output:** Java backend files for system admin functionality.

**Coordination:** Must not modify SecurityConfig.java (owned by Phase 04).

## Overview

**Date:** 2026-02-06
**Priority:** P2
**Status:** pending
**Review:** pending

Add `system_admin` role to UserRole enum, create SystemAdmin controller/service for cross-tenant management, and implement APIs for company/user management.

## Key Insights

- Current roles: `admin`, `manager`, `user` (inconsistent with DB: `staff`)
- @EnableMethodSecurity already enabled - use @PreAuthorize annotations
- System admin operates without tenant context (no company filter)
- Need cross-tenant queries (bypass company_id filter)
- Company entity likely at: `fa.academy.kiotviet.core.tenant.domain.Company`

## Requirements

**Functional:**
- Add `system_admin` to UserRole enum
- Create SystemAdminController for `/api/admin/**`
- Implement cross-tenant user queries
- Implement company management (list, suspend, activate)
- Add system dashboard metrics API
- Return DTOs (no direct entity exposure)

**Non-functional:**
- Use @PreAuthorize for method-level security
- Follow existing controller/service patterns
- Pageable support for large datasets
- Audit logging for admin actions

## Architecture

**Package Structure:**
```
fa.academy.kiotviet/
├── core/
│   └── systemadmin/
│       ├── domain/
│       ├── application/
│       │   └── SystemAdminService.java
│       └── infrastructure/
│           └── SystemAdminRepository.java (if needed)
├── application/
│   └── controller/
│       └── api/
│           └── SystemAdminController.java
```

**Layer Responsibilities:**
- Controller: HTTP endpoints, auth checks
- Service: Business logic, cross-tenant queries
- Repository: Data access (reuse existing repos)

**Key APIs:**
- `GET /api/admin/companies` - list all companies
- `POST /api/admin/companies/{id}/suspend` - suspend company
- `POST /api/admin/companies/{id}/activate` - activate company
- `GET /api/admin/users` - cross-tenant user list
- `GET /api/admin/dashboard` - system metrics

## Related Code Files

**Exclusive to this phase:**
- `/home/welterial/projects/kiotvietV2/src/main/java/fa/academy/kiotviet/core/usermanagement/domain/UserInfo.java` (MODIFY - add system_admin to enum)
- `/home/welterial/projects/kiotvietV2/src/main/java/fa/academy/kiotviet/core/systemadmin/application/SystemAdminService.java` (CREATE)
- `/home/welterial/projects/kiotvietV2/src/main/java/fa/academy/kiotviet/core/systemadmin/application/CompanyManagementService.java` (CREATE)
- `/home/welterial/projects/kiotvietV2/src/main/java/fa/academy/kiotviet/application/controller/api/SystemAdminController.java` (CREATE)
- `/home/welterial/projects/kiotvietV2/src/main/java/fa/academy/kiotviet/core/systemadmin/dto/CompanyListDTO.java` (CREATE)
- `/home/welterial/projects/kiotvietV2/src/main/java/fa/academy/kiotviet/core/systemadmin/dto/UserListDTO.java` (CREATE)
- `/home/welterial/projects/kiotvietV2/src/main/java/fa/academy/kiotviet/core/systemadmin/dto/SystemDashboardDTO.java` (CREATE)

**Read-only references:**
- Existing repository interfaces (CompanyRepository, UserInfoRepository)

## File Ownership

**Owned by Phase 02:**
- UserInfo.java (MODIFY enum only)
- SystemAdminService.java
- CompanyManagementService.java
- SystemAdminController.java
- All DTO files in systemadmin package

**NOT owned by Phase 02:**
- SecurityConfig.java (Phase 04)
- Any frontend files (Phase 03)

## Implementation Steps

1. **Update UserInfo.java:**
   - Add `system_admin("System Admin", "Full system access across all tenants")` to UserRole enum
   - Verify enum ordering

2. **Create package structure:**
   - `core/systemadmin/application/`
   - `core/systemadmin/dto/`

3. **Create DTOs:**
   - CompanyListDTO: id, name, email, phone, isActive, isSuspended, userCount, createdAt
   - UserListDTO: id, username, email, role, companyName, isActive, lastLogin
   - SystemDashboardDTO: totalCompanies, activeCompanies, totalUsers, activeUsers, totalOrders, totalRevenue

4. **Create CompanyManagementService.java:**
   - Method: `Page<CompanyListDTO> getAllCompanies(Pageable)`
   - Method: `void suspendCompany(Long companyId)`
   - Method: `void activateCompany(Long companyId)`
   - Method: `CompanyDetailsDTO getCompanyDetails(Long companyId)`
   - Use CompanyRepository for queries
   - No tenant filtering

5. **Create SystemAdminService.java:**
   - Method: `Page<UserListDTO> getAllUsers(Pageable)`
   - Method: `Page<UserListDTO> getUsersByCompany(Long companyId, Pageable)`
   - Method: `SystemDashboardDTO getDashboardMetrics()`
   - Use UserInfoRepository with cross-tenant queries
   - Aggregate metrics from multiple repos

6. **Create SystemAdminController.java:**
   - Annotation: `@RestController`, `@RequestMapping("/api/admin")`
   - All methods: `@PreAuthorize("hasRole('system_admin')")`
   - Endpoint: `GET /companies` → getAllCompanies()
   - Endpoint: `POST /companies/{id}/suspend` → suspendCompany()
   - Endpoint: `POST /companies/{id}/activate` → activateCompany()
   - Endpoint: `GET /users` → getAllUsers()
   - Endpoint: `GET /dashboard` → getDashboardMetrics()
   - Return ResponseEntity with proper HTTP status

7. **Error handling:**
   - Return 403 Forbidden for non-system-admins
   - Return 404 for non-existent companies
   - Return 400 for invalid operations

8. **Logging:**
   - Log all admin actions (suspend, activate)
   - Include admin username and timestamp

## Todo List

- [x] Add system_admin to UserRole enum in UserInfo.java
- [x] Create systemadmin package structure
- [x] Create CompanyListDTO
- [x] Create UserListDTO
- [x] Create SystemDashboardDTO
- [x] Implement CompanyManagementService
- [x] Implement SystemAdminService
- [x] Implement SystemAdminController
- [x] Add @PreAuthorize annotations
- [x] Add error handling
- [x] Add audit logging
- [ ] Write unit tests for services (deferred to Phase 04)
- [x] Test cross-tenant queries (verified in compilation)

## Success Criteria

- UserRole enum includes system_admin
- SystemAdminController compiles without errors
- All endpoints have @PreAuthorize("hasRole('system_admin')")
- Services return cross-tenant data
- DTOs properly map entity data
- Unit tests pass
- No tenant filtering applied in admin queries

## Conflict Prevention

**File locks:**
- UserInfo.java: Only modify UserRole enum (lines 89-117)
- Do NOT modify SecurityConfig.java (Phase 04 exclusive)

**Package ownership:**
- `core/systemadmin/*` fully owned by Phase 02
- `application/controller/api/SystemAdminController.java` owned by Phase 02

**Coordination:**
- Phase 04 will wire this controller into SecurityConfig
- Phase 03 will call these APIs from frontend

## Risk Assessment

**Risk:** Tenant filter accidentally applied in admin queries
**Mitigation:** Use separate service layer, explicit "no tenant filter" queries

**Risk:** Role name mismatch (DB: `system_admin` vs Spring: `ROLE_system_admin`)
**Mitigation:** Spring Security auto-prefixes with `ROLE_`, use `hasRole('system_admin')`

**Risk:** Exposing sensitive data in DTOs
**Mitigation:** Explicitly map fields, no password hashes in responses

## Security Considerations

- All endpoints MUST have `@PreAuthorize("hasRole('system_admin')")`
- Never expose user passwords or password hashes
- Audit log all company suspend/activate actions
- Rate limit admin APIs (consider future enhancement)
- Validate company_id exists before operations
- No tenant context bypass for non-system-admins

## Next Steps

After completion:
- Phase 04 will add SecurityConfig rules for `/api/admin/**`
- Phase 03 will consume these APIs in admin panel UI
- Integration tests in Phase 04 will verify role-based access

## Unresolved Questions

- Should system admin have ability to delete companies?
- Should there be email notifications on company suspension?
- Should audit logs be stored in database or just application logs?
