---
phase: 03
title: Frontend Admin Panel - Templates & UI
status: completed
priority: P2
effort: 2h
dependencies: []
completed: 2026-02-06
---

# Phase 03: Frontend Admin Panel - Templates & UI

## Context Links

- Templates dir: `/home/welterial/projects/kiotvietV2/src/main/resources/templates/`
- Dashboard example: `/home/welterial/projects/kiotvietV2/src/main/resources/templates/dashboard/dashboard.html`
- Static resources: `/home/welterial/projects/kiotvietV2/src/main/resources/static/`
- Header: `/home/welterial/projects/kiotvietV2/src/main/resources/templates/common/header.html`
- Navigation: `/home/welterial/projects/kiotvietV2/src/main/resources/templates/common/navigation.html`

## Parallelization Info

**Independent:** This phase has no dependencies and can run in parallel with Phase 01 and Phase 02.

**Output:** Thymeleaf templates, CSS, and JavaScript for system admin panel.

**Coordination:** Must not create backend controllers (owned by Phase 02).

## Overview

**Date:** 2026-02-06
**Priority:** P2
**Status:** completed
**Review:** completed
**Completed:** 2026-02-06

Create admin panel UI with Thymeleaf templates for company management, user listing, and system dashboard. Uses Bootstrap 5.3 for styling.

## Key Insights

- Current stack: Thymeleaf + Bootstrap 5.3
- Existing template structure: `templates/module-name/page-name.html`
- Common components: header.html, navigation.html
- API calls via vanilla JavaScript (no framework mentioned)
- Responsive design required

## Requirements

**Functional:**
- Admin dashboard page (`/admin/dashboard`)
- Company list page (`/admin/companies`)
- User list page (`/admin/users`)
- Navigation menu for admin section
- Company suspend/activate actions
- Search and pagination
- System metrics display

**Non-functional:**
- Responsive design (mobile-friendly)
- Bootstrap 5.3 styling
- Accessible (WCAG 2.1 AA)
- Fast page load (<2s)
- Client-side validation

## Architecture

**Template Structure:**
```
templates/
└── admin/
    ├── admin-dashboard.html          (system metrics)
    ├── admin-company-list.html       (all companies)
    ├── admin-company-details.html    (company detail view)
    ├── admin-user-list.html          (cross-tenant users)
    └── components/
        ├── admin-header.html         (admin-specific header)
        └── admin-navigation.html     (admin sidebar)
```

**Static Resources:**
```
static/
├── css/
│   └── admin-panel.css               (admin-specific styles)
└── js/
    └── admin-panel.js                (admin API calls)
```

**Page Controller (not created by this phase):**
- Phase 04 or separate ticket will create `AdminPageController.java`

## Related Code Files

**Exclusive to this phase:**
- `/home/welterial/projects/kiotvietV2/src/main/resources/templates/admin/admin-dashboard.html` (CREATE)
- `/home/welterial/projects/kiotvietV2/src/main/resources/templates/admin/admin-company-list.html` (CREATE)
- `/home/welterial/projects/kiotvietV2/src/main/resources/templates/admin/admin-company-details.html` (CREATE)
- `/home/welterial/projects/kiotvietV2/src/main/resources/templates/admin/admin-user-list.html` (CREATE)
- `/home/welterial/projects/kiotvietV2/src/main/resources/templates/admin/components/admin-header.html` (CREATE)
- `/home/welterial/projects/kiotvietV2/src/main/resources/templates/admin/components/admin-navigation.html` (CREATE)
- `/home/welterial/projects/kiotvietV2/src/main/resources/static/css/admin-panel.css` (CREATE)
- `/home/welterial/projects/kiotvietV2/src/main/resources/static/js/admin-panel.js` (CREATE)

**Read-only references:**
- `/home/welterial/projects/kiotvietV2/src/main/resources/templates/common/header.html`
- `/home/welterial/projects/kiotvietV2/src/main/resources/templates/dashboard/dashboard.html`

## File Ownership

**Owned by Phase 03:**
- All files in `templates/admin/`
- `static/css/admin-panel.css`
- `static/js/admin-panel.js`

**NOT owned by Phase 03:**
- SecurityConfig.java (Phase 04)
- SystemAdminController.java (Phase 02)
- Any Java backend files

## Implementation Steps

1. **Create directory structure:**
   - `templates/admin/`
   - `templates/admin/components/`

2. **Create admin-header.html:**
   - System admin badge
   - Logout button
   - Link back to main app (if user has dual roles)
   - Breadcrumb navigation

3. **Create admin-navigation.html:**
   - Sidebar menu:
     - Dashboard (icon: chart)
     - Companies (icon: building)
     - Users (icon: users)
     - Settings (icon: cog)
   - Bootstrap nav-pills or vertical nav
   - Active state highlighting

4. **Create admin-dashboard.html:**
   - Layout: Thymeleaf layout dialect or include header/nav
   - Metrics cards:
     - Total Companies (with active count)
     - Total Users (with active count)
     - Suspended Companies (warning badge)
     - System health status
   - Recent activity table (last 10 actions)
   - Charts: company growth, user growth (Chart.js or inline SVG)
   - API call: `GET /api/admin/dashboard`

5. **Create admin-company-list.html:**
   - Table columns: ID, Name, Email, Phone, Status (Active/Suspended), Users Count, Created Date, Actions
   - Actions: View, Suspend/Activate button
   - Search bar (filter by name/email)
   - Pagination controls (Bootstrap pagination)
   - API call: `GET /api/admin/companies?page=0&size=20`
   - Modal confirm for suspend action

6. **Create admin-company-details.html:**
   - Company info panel
   - User list for this company
   - Order statistics
   - Suspend/Activate button
   - Back to company list
   - API call: `GET /api/admin/companies/{id}`

7. **Create admin-user-list.html:**
   - Table columns: ID, Username, Email, Role, Company, Status, Last Login, Actions
   - Search/filter: by username, email, company, role
   - Pagination
   - API call: `GET /api/admin/users?page=0&size=20`
   - No edit/delete (view-only for now)

8. **Create admin-panel.css:**
   - Admin sidebar styling
   - Metrics card styles
   - Table enhancements (striped, hover)
   - Badge colors (active: green, suspended: red)
   - Admin header distinct color scheme (e.g., dark theme)
   - Responsive breakpoints

9. **Create admin-panel.js:**
   - Function: `loadDashboardMetrics()`
   - Function: `loadCompanies(page, size)`
   - Function: `suspendCompany(companyId)`
   - Function: `activateCompany(companyId)`
   - Function: `loadUsers(page, size)`
   - Function: `searchCompanies(query)`
   - Function: `searchUsers(query)`
   - Error handling (show toast notifications)
   - JWT token handling (read from localStorage or cookie)

10. **Common components integration:**
    - Reuse header.html or create admin-specific variant
    - Admin nav should be distinct from tenant user nav

## Todo List

- [ ] Create templates/admin/ directory
- [ ] Create admin-header.html component
- [ ] Create admin-navigation.html component
- [ ] Create admin-dashboard.html
- [ ] Create admin-company-list.html
- [ ] Create admin-company-details.html
- [ ] Create admin-user-list.html
- [ ] Create admin-panel.css
- [ ] Create admin-panel.js
- [ ] Add Chart.js or equivalent for dashboard charts
- [ ] Implement suspend/activate confirmation modal
- [ ] Add pagination controls
- [ ] Test responsive design (mobile, tablet, desktop)
- [ ] Add loading spinners for API calls
- [ ] Test error states (API failures)

## Success Criteria

- All admin pages render without errors
- Dashboard displays metrics from API
- Company list shows paginated data
- Suspend/Activate buttons trigger API calls
- User list displays cross-tenant users
- Search and pagination work correctly
- Responsive on mobile devices
- No console errors in browser
- Accessible (keyboard navigation, ARIA labels)

## Conflict Prevention

**File locks:**
- No overlap with Phase 02 (backend Java files)
- No overlap with Phase 04 (SecurityConfig)

**Coordination:**
- Phase 02 APIs must match endpoint expectations in JS
- Phase 04 will create page controller to serve these templates

**Naming convention:**
- Prefix all admin templates with `admin-` to avoid conflicts

## Risk Assessment

**Risk:** API endpoints not matching Phase 02 implementation
**Mitigation:** Define API contract clearly in Phase 02 plan, follow RESTful conventions

**Risk:** JWT token not accessible in admin panel
**Mitigation:** Use same authentication mechanism as main app, test token passing

**Risk:** Bootstrap version mismatch
**Mitigation:** Verify Bootstrap 5.3 CDN link or local version

## Security Considerations

- No sensitive data in HTML comments
- No hardcoded credentials
- XSS prevention (Thymeleaf auto-escapes)
- CSRF token in forms (if using form submit)
- JWT token stored securely (httpOnly cookie preferred)
- Rate limit API calls in JavaScript
- Confirm before destructive actions (suspend company)

## Next Steps

After completion:
- Phase 04 will create AdminPageController to serve these templates
- Phase 04 will add `/admin/**` route protection in SecurityConfig
- Integration testing will verify UI flows

## Unresolved Questions

- Should admin panel have its own login page or share with main app?
- Should there be audit log viewer in admin panel?
- Chart library preference: Chart.js, ApexCharts, or inline SVG?
