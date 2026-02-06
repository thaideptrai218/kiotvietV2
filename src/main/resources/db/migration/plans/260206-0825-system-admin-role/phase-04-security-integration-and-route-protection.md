---
phase: 04
title: Security Integration & Route Protection
status: completed
priority: P2
effort: 1h
dependencies: [phase-01, phase-02, phase-03]
completed: 2026-02-06
---

# Phase 04: Security Integration & Route Protection

## Context Links

- SecurityConfig: `/home/welterial/projects/kiotvietV2/src/main/java/fa/academy/kiotviet/config/SecurityConfig.java`
- SystemAdminController: `/home/welterial/projects/kiotvietV2/src/main/java/fa/academy/kiotviet/application/controller/api/SystemAdminController.java` (Phase 02)
- Admin templates: `/home/welterial/projects/kiotvietV2/src/main/resources/templates/admin/` (Phase 03)
- Page controller examples: `/home/welterial/projects/kiotvietV2/src/main/java/fa/academy/kiotviet/application/controller/web/DashboardController.java`

## Parallelization Info

**Sequential:** This phase REQUIRES Phase 01, 02, and 03 to be complete.

**Output:** Updated SecurityConfig, new AdminPageController, integration tests.

**Blocking:** Cannot start until all three parallel phases finish.

## Overview

**Date:** 2026-02-06
**Priority:** P2
**Status:** pending
**Review:** pending

Wire together database migration, backend APIs, and frontend templates. Add route protection for `/admin/**` endpoints and create page controller for serving admin templates.

## Key Insights

- SecurityConfig currently uses form login + JWT
- @EnableMethodSecurity is enabled (method-level security active)
- Need both URL-based and method-level protection
- AdminPageController serves Thymeleaf templates from Phase 03
- Integration tests verify complete flow

## Requirements

**Functional:**
- Protect `/admin/**` routes for system_admin role only
- Protect `/api/admin/**` routes for system_admin role only
- Create AdminPageController to serve admin templates
- Return 403 Forbidden for non-system-admins
- Redirect to login if not authenticated
- Integration tests for role-based access

**Non-functional:**
- No breaking changes to existing security config
- Maintain backward compatibility
- Clear error messages for unauthorized access

## Architecture

**Security Layers:**
1. URL-based protection (SecurityConfig)
2. Method-level protection (@PreAuthorize in controllers)
3. Template-level checks (Thymeleaf sec:authorize)

**Components:**
- SecurityConfig.java (MODIFY)
- AdminPageController.java (CREATE)
- Integration test suite (CREATE)

## Related Code Files

**Exclusive to this phase:**
- `/home/welterial/projects/kiotvietV2/src/main/java/fa/academy/kiotviet/config/SecurityConfig.java` (MODIFY)
- `/home/welterial/projects/kiotvietV2/src/main/java/fa/academy/kiotviet/application/controller/web/AdminPageController.java` (CREATE)
- `/home/welterial/projects/kiotvietV2/src/test/java/fa/academy/kiotviet/integration/SystemAdminSecurityTest.java` (CREATE)

**Dependencies from other phases:**
- Phase 01: V16__Add_system_admin_role.sql (database)
- Phase 02: SystemAdminController.java (API)
- Phase 03: templates/admin/*.html (UI)

## File Ownership

**Owned by Phase 04:**
- SecurityConfig.java (MODIFY)
- AdminPageController.java (CREATE)
- SystemAdminSecurityTest.java (CREATE)

**No overlap** with Phase 01, 02, or 03.

## Implementation Steps

1. **Update SecurityConfig.java:**
   - Add to authorizeHttpRequests() chain:
     ```java
     // System Admin routes (BEFORE other rules)
     .requestMatchers("/admin/**").hasRole("system_admin")
     .requestMatchers("/api/admin/**").hasRole("system_admin")
     ```
   - Position: Insert after static resources, before authenticated routes
   - Ensure admin routes checked before `.anyRequest()`

2. **Create AdminPageController.java:**
   - Package: `fa.academy.kiotviet.application.controller.web`
   - Annotation: `@Controller`, `@RequestMapping("/admin")`
   - Class-level: `@PreAuthorize("hasRole('system_admin')")`
   - Methods:
     - `GET /admin/dashboard` → return "admin/admin-dashboard"
     - `GET /admin/companies` → return "admin/admin-company-list"
     - `GET /admin/companies/{id}` → return "admin/admin-company-details"
     - `GET /admin/users` → return "admin/admin-user-list"
   - Use @GetMapping annotations
   - No business logic (just template serving)

3. **Update common navigation (optional):**
   - Modify `/templates/common/navigation.html` to show "Admin Panel" link if user has system_admin role
   - Use Thymeleaf security: `sec:authorize="hasRole('system_admin')"`
   - Add dependency if needed: `spring-boot-starter-security` with Thymeleaf extras

4. **Create SystemAdminSecurityTest.java:**
   - Integration test with @SpringBootTest
   - Test cases:
     - `testSystemAdminCanAccessAdminPanel()` - 200 OK
     - `testRegularUserCannotAccessAdminPanel()` - 403 Forbidden
     - `testUnauthenticatedUserRedirectedToLogin()` - 302 redirect
     - `testSystemAdminCanAccessApiEndpoints()` - 200 OK
     - `testRegularUserCannotAccessApiEndpoints()` - 403 Forbidden
   - Use MockMvc or TestRestTemplate
   - Mock users with different roles

5. **Verify JWT filter compatibility:**
   - Ensure JwtAuthenticationFilter recognizes system_admin role
   - Check JWT token includes role claim
   - Test JWT auth for `/api/admin/**` endpoints

6. **Error handling:**
   - Custom 403 error page for admin routes (optional)
   - JSON error response for API endpoints (already handled)
   - Clear error messages

7. **Run database migration:**
   - Apply V16__Add_system_admin_role.sql
   - Verify system admin user created
   - Test login with sysadmin credentials

8. **End-to-end testing:**
   - Login as system admin
   - Access `/admin/dashboard`
   - Verify companies list loads
   - Test suspend/activate actions
   - Verify regular user blocked from admin panel

## Todo List

- [ ] Update SecurityConfig.java with admin route protection
- [ ] Create AdminPageController.java
- [ ] Add all page serving methods to controller
- [ ] Create SystemAdminSecurityTest.java
- [ ] Write test for system admin access
- [ ] Write test for regular user blocked
- [ ] Write test for unauthenticated redirect
- [ ] Test JWT token with system_admin role
- [ ] Run database migration V16
- [ ] Verify system admin user login
- [ ] Manual test: login as sysadmin
- [ ] Manual test: access /admin/dashboard
- [ ] Manual test: regular user gets 403
- [ ] Update navigation.html with admin link (optional)
- [ ] Run all integration tests

## Success Criteria

- SecurityConfig compiles without errors
- AdminPageController serves all admin templates
- System admin can access `/admin/**` routes (200 OK)
- Regular users get 403 on `/admin/**` routes
- Unauthenticated users redirected to login
- API endpoints `/api/admin/**` protected
- All integration tests pass
- Manual testing confirms role-based access
- No regression in existing security rules

## Conflict Prevention

**File locks:**
- SecurityConfig.java: Only Phase 04 modifies this file
- No file conflicts with other phases

**Dependency coordination:**
- Must wait for Phase 01 migration to complete (database)
- Must wait for Phase 02 controller to be created (API)
- Must wait for Phase 03 templates to be created (UI)

**Integration points:**
- Verify Phase 02 API endpoints match expected paths
- Verify Phase 03 template paths match controller return values

## Risk Assessment

**Risk:** SecurityConfig merge conflicts if other features modified it
**Mitigation:** Apply changes carefully, test existing routes still work

**Risk:** Role name mismatch (system_admin vs ROLE_system_admin)
**Mitigation:** Spring Security auto-prefixes, use hasRole('system_admin')

**Risk:** JWT filter doesn't recognize new role
**Mitigation:** Verify JWT payload includes roles, update filter if needed

**Risk:** Circular dependency between security and controllers
**Mitigation:** Keep security config lightweight, no business logic

## Security Considerations

- All admin routes MUST require system_admin role
- No fallback to "admin" role (strict separation)
- Audit log access attempts to admin panel (consider logging interceptor)
- Rate limit admin endpoints (future enhancement)
- CSRF protection for admin forms (verify enabled)
- Session timeout for admin users (consider shorter timeout)
- No role elevation attacks (verify @PreAuthorize enforced)

## Next Steps

After completion:
- Deploy to staging environment
- Test with real system admin user
- Document admin panel access in operations guide
- Consider audit logging enhancement
- Monitor for unauthorized access attempts
- Add admin panel to navigation menu (if not already done)

## Unresolved Questions

- Should system admin session timeout be shorter than regular users?
- Should admin panel have separate audit log table?
- Should there be email alerts for admin actions (suspend company)?
- Should regular admins (role: admin) see limited admin panel view?
