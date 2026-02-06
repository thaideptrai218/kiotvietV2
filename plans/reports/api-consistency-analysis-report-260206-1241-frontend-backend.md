# Frontend-Backend API Consistency Analysis Report

**Date:** February 6, 2026
**Type:** API Integration Analysis
**Status:** Completed

## Executive Summary

Analysis of frontend API calls against the `SystemAdminController.java` backend controller reveals:
- **CRITICAL BUG** in legacy `admin-panel.js`: Wrong API base path
- **NEW HTML pages** have correct API integration
- Several missing endpoints in frontend implementations

## Backend API Endpoints (SystemAdminController.java)

### Base Path: `/admin/api`

#### Dashboard Endpoints
| Method | Endpoint | Params | Purpose |
|--------|----------|--------|---------|
| GET | `/admin/api/dashboard` | - | Dashboard metrics |

#### Company Endpoints
| Method | Endpoint | Params | Purpose |
|--------|----------|--------|---------|
| GET | `/admin/api/companies` | page, size, sortBy, sortDir | List companies (paginated) |
| GET | `/admin/api/companies/{id}` | - | Company details |
| POST | `/admin/api/companies` | SystemAdminCompanyCreateDTO | Create company |
| PUT | `/admin/api/companies/{id}` | SystemAdminCompanyUpdateDTO | Update company |
| POST | `/admin/api/companies/{id}/suspend` | - | Suspend company |
| POST | `/admin/api/companies/{id}/activate` | - | Activate company |
| DELETE | `/admin/api/companies/{id}` | - | Delete company |
| GET | `/admin/api/companies/search` | keyword | Search companies |

#### User Endpoints
| Method | Endpoint | Params | Purpose |
|--------|----------|--------|---------|
| GET | `/admin/api/users` | page, size, sortBy, sortDir | List users (paginated) |
| GET | `/admin/api/companies/{companyId}/users` | page, size | Get users by company |
| GET | `/admin/api/users/{id}` | - | User details |
| POST | `/admin/api/users` | SystemAdminUserCreateDTO | Create user |
| PUT | `/admin/api/users/{id}` | SystemAdminUserUpdateDTO | Update user |
| POST | `/admin/api/users/{id}/activate` | - | Activate user |
| POST | `/admin/api/users/{id}/deactivate` | - | Deactivate user |
| DELETE | `/admin/api/users/{id}` | - | Delete user |
| GET | `/admin/api/users/search` | keyword | Search users |

## Frontend API Calls Analysis

### 1. admin-panel.js (LEGACY - NOT USED)

**Status:** 🔴 CRITICAL ISSUES

| Issue | Description | Impact |
|-------|-------------|--------|
| **Wrong Base Path** | Uses `/api/admin` instead of `/admin/api` | All API calls fail |
| **Missing Endpoints** | Missing search, delete, create, update endpoints | Incomplete feature set |

**Issues Found:**
```javascript
// Line 12 - WRONG BASE PATH
const CONFIG = {
    apiBaseUrl: '/api/admin',  // ❌ Should be '/admin/api'
    ...
};

// Missing implementations:
// - companies/search
// - companies/create (POST)
// - companies/update (PUT)
// - companies/delete (DELETE)
// - users/create (POST)
// - users/update (PUT)
// - users/delete (DELETE)
// - users/search
// - dashboard/charts
// - activity endpoints
```

**Recommendation:** This file appears to be obsolete as new HTML pages use inline scripts.

---

### 2. admin-dashboard.html (NEW - Inline Script)

**Status:** ✅ CORRECT

| Frontend Call | Backend Match | Status |
|---------------|---------------|--------|
| `GET /admin/api/dashboard` | `@GetMapping("/dashboard")` | ✅ Correct |

**Code:** Lines 264-283
```javascript
const response = await fetch('/admin/api/dashboard', {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
});
```

---

### 3. admin-company-list.html (NEW - Inline Script)

**Status:** ✅ CORRECT (but missing filter support)

| Frontend Call | Backend Match | Status |
|---------------|---------------|--------|
| `GET /admin/api/companies` | `@GetMapping("/companies")` | ✅ Correct |
| `POST /admin/api/companies/{id}/suspend` | `@PostMapping("/companies/{id}/suspend")` | ✅ Correct |
| `POST /admin/api/companies/{id}/activate` | `@PostMapping("/companies/{id}/activate")` | ✅ Correct |

**Note:** Frontend sends `keyword` for search but backend may expect query param handling.

**Code:** Lines 247-261
```javascript
const response = await fetch(`/admin/api/companies?${params.toString()}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
});
```

**Potential Issue:** Frontend sends `status` filter but backend doesn't have status filter parameter in controller.

---

### 4. admin-user-list.html (NEW - Inline Script)

**Status:** ✅ CORRECT (but missing filter support)

| Frontend Call | Backend Match | Status |
|---------------|---------------|--------|
| `GET /admin/api/companies` (for filter) | `@GetMapping("/companies")` | ✅ Correct |
| `GET /admin/api/users` | `@GetMapping("/users")` | ✅ Correct |
| `POST /admin/api/users/{id}/activate` | `@PostMapping("/users/{id}/activate")` | ✅ Correct |
| `POST /admin/api/users/{id}/deactivate` | `@PostMapping("/users/{id}/deactivate")` | ✅ Correct |

**Potential Issues:**
- Frontend sends `role`, `companyId`, `status` filters but backend controller doesn't have these parameters
- Search uses `keyword` which may need backend support

**Code:** Lines 277-280
```javascript
const response = await fetch(`/admin/api/users?${params.toString()}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
});
```

---

### 5. admin-company-details.html (NEW - Inline Script)

**Status:** ✅ CORRECT

| Frontend Call | Backend Match | Status |
|---------------|---------------|--------|
| `GET /admin/api/companies/{id}` | `@GetMapping("/companies/{id}")` | ✅ Correct |
| `GET /admin/api/companies/{id}/users` | `@GetMapping("/companies/{companyId}/users")` | ✅ Correct |
| `POST /admin/api/companies/{id}/suspend` | `@PostMapping("/companies/{id}/suspend")` | ✅ Correct |
| `POST /admin/api/companies/{id}/activate` | `@PostMapping("/companies/{id}/activate")` | ✅ Correct |

**Code:** Lines 254-257, 315-318
```javascript
// Company details
const response = await fetch(`/admin/api/companies/${companyId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
});

// Company users
const response = await fetch(`/admin/api/companies/${companyId}/users?size=100`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
});
```

## Issues Summary

### Critical Issues

| # | Issue | File | Impact | Fix |
|---|-------|------|--------|-----|
| 1 | Wrong API base path | `admin-panel.js:12` | All calls fail | Change `/api/admin` to `/admin/api` |

### Missing Backend Features

| # | Feature | Frontend Needs | Backend Status |
|---|---------|----------------|----------------|
| 1 | Companies status filter | `admin-company-list.html` | Not in controller |
| 2 | Companies keyword search | `admin-company-list.html` | Has `/search` endpoint |
| 3 | Users role filter | `admin-user-list.html` | Not in controller |
| 4 | Users company filter | `admin-user-list.html` | Not in controller |
| 5 | Users status filter | `admin-user-list.html` | Not in controller |
| 6 | Users keyword search | `admin-user-list.html` | Has `/search` endpoint |

### Missing Frontend Implementations

| # | Endpoint | Purpose | Status |
|---|----------|---------|--------|
| 1 | POST `/admin/api/companies` | Create company | Not in new pages |
| 2 | PUT `/admin/api/companies/{id}` | Update company | Not in new pages |
| 3 | DELETE `/admin/api/companies/{id}` | Delete company | Not in new pages |
| 4 | GET `/admin/api/companies/search` | Search companies | Not used (inline search) |
| 5 | POST `/admin/api/users` | Create user | Not in new pages |
| 6 | PUT `/admin/api/users/{id}` | Update user | Not in new pages |
| 7 | DELETE `/admin/api/users/{id}` | Delete user | Not in new pages |
| 8 | GET `/admin/api/users/search` | Search users | Not used (inline search) |
| 9 | GET `/admin/api/users/{id}` | User details page | Not implemented |

## Recommendations

### Immediate Actions Required

1. **Fix admin-panel.js or deprecate it**
   - Either fix the base path from `/api/admin` to `/admin/api`
   - Or mark as deprecated since new pages use inline scripts

2. **Add filter support to backend controller**
   - Add `status` parameter to companies list endpoint
   - Add `role`, `companyId`, `status` parameters to users list endpoint
   - Add `keyword` search parameter to both list endpoints (or use search endpoints)

3. **Implement missing frontend features**
   - Company create/edit modals
   - User create/edit modals
   - User details page
   - Delete confirmations

### Optional Improvements

1. **Consolidate API calls into shared module**
   - Extract common API patterns into shared JS file
   - Reduces code duplication across HTML pages

2. **Add error handling improvements**
   - Better error messages from backend
   - Consistent error response format

3. **Add loading states**
   - Skeleton screens
   - Progress indicators

## Backend Enhancement Suggestions

### Add Filter Support to SystemAdminController.java

```java
// Companies list with filters
@GetMapping("/companies")
@PreAuthorize("hasRole('SYSTEM_ADMIN')")
public ResponseEntity<SuccessResponse<Page<SystemAdminCompanyListDTO>>> getAllCompanies(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(defaultValue = "createdAt") String sortBy,
        @RequestParam(defaultValue = "desc") String sortDir,
        @RequestParam(required = false) String status,  // NEW
        @RequestParam(required = false) String keyword) { // NEW
    // ...
}

// Users list with filters
@GetMapping("/users")
@PreAuthorize("hasRole('SYSTEM_ADMIN')")
public ResponseEntity<SuccessResponse<Page<SystemAdminUserListDTO>>> getAllUsers(
        @RequestParam(defaultValue = "0") int page,
        @RequestParam(defaultValue = "20") int size,
        @RequestParam(defaultValue = "createdAt") String sortBy,
        @RequestParam(defaultValue = "desc") String sortDir,
        @RequestParam(required = false) String role,  // NEW
        @RequestParam(required = false) Long companyId,  // NEW
        @RequestParam(required = false) String status,  // NEW
        @RequestParam(required = false) String keyword) { // NEW
    // ...
}
```

## Conclusion

The new HTML admin pages (admin-dashboard.html, admin-company-list.html, admin-user-list.html, admin-company-details.html) have **correct API base paths and endpoint mappings**. The main issues are:

1. **Legacy admin-panel.js** has wrong base path (should be deprecated)
2. **Backend missing filter parameters** that frontend expects
3. **Missing frontend implementations** for create/update/delete operations

**Status:** The admin panel is functional for read-only operations. Filter features need backend support.

## Next Steps

1. Update backend controller to support filter parameters
2. Implement missing frontend CRUD operations
3. Deprecate or remove admin-panel.js
4. Test all API integrations
