---
phase: 01
title: Database Migration - System Admin Role
status: completed
priority: P2
effort: 1h
dependencies: []
completed: 2026-02-06
---

# Phase 01: Database Migration - System Admin Role

## Context Links

- Base schema: `/home/welterial/projects/kiotvietV2/src/main/resources/db/migration/V1__Create_kiotviet_core_tables.sql`
- UserInfo entity: `/home/welterial/projects/kiotvietV2/src/main/java/fa/academy/kiotviet/core/usermanagement/domain/UserInfo.java`
- Migration dir: `/home/welterial/projects/kiotvietV2/src/main/resources/db/migration/`

## Parallelization Info

**Independent:** This phase has no dependencies and can run in parallel with Phase 02 and Phase 03.

**Output:** Creates V16__Add_system_admin_role.sql migration file.

## Overview

**Date:** 2026-02-06
**Priority:** P2
**Status:** completed
**Review:** completed

Create Flyway migration to add `system_admin` role enum value, seed a system admin user, and add company management fields.

## Key Insights

- Current role enum in DB: `admin`, `manager`, `staff` (mismatch with Java: `admin`, `manager`, `user`)
- Need to handle enum migration carefully in MySQL
- System admin should NOT have company_id constraint (or use special company_id = 0)
- Seed password must be BCrypt hashed

## Requirements

**Functional:**
- Add `system_admin` to user_info.role ENUM
- Create seed system admin user (username: `sysadmin`, email: `admin@system.local`)
- Add `is_suspended` BOOLEAN to companies table
- Handle company_id for system admin (nullable or special value)

**Non-functional:**
- Migration must be idempotent
- BCrypt password hash for seed user
- Backwards compatible (existing data unaffected)

## Architecture

**Database Changes:**
1. Alter `user_info.role` enum: add `system_admin`
2. Modify `user_info.company_id` to allow NULL for system admins
3. Add `companies.is_suspended` field
4. Insert system admin seed record

**Migration Pattern:**
- Use `ALTER TABLE ... MODIFY COLUMN` for enum
- Set company_id = NULL for system_admin
- Generate BCrypt hash: `$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy` (password: `admin123`)

## Related Code Files

**Exclusive to this phase:**
- `/home/welterial/projects/kiotvietV2/src/main/resources/db/migration/V16__Add_system_admin_role.sql` (CREATE)

**Read-only references:**
- `/home/welterial/projects/kiotvietV2/src/main/resources/db/migration/V1__Create_kiotviet_core_tables.sql`

## File Ownership

**Owned by Phase 01:**
- `V16__Add_system_admin_role.sql`

**No overlap** with Phase 02, 03, or 04.

## Implementation Steps

1. Create migration file `V16__Add_system_admin_role.sql`
2. Alter user_info table:
   - Modify role enum to include `system_admin`
   - Make company_id nullable (or keep constraint, use company_id=0)
3. Add is_suspended column to companies:
   - `ALTER TABLE companies ADD COLUMN is_suspended BOOLEAN DEFAULT FALSE AFTER is_active`
4. Create system company record (id=0, name='System'):
   - `INSERT INTO companies (id, name, email, is_active) VALUES (0, 'System', 'system@internal', TRUE)`
5. Insert system admin user:
   - username: `sysadmin`
   - email: `admin@system.local`
   - password hash: `$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy`
   - role: `system_admin`
   - company_id: 0
   - is_active: TRUE
6. Insert user_auth record for system admin
7. Add indexes if needed

## Todo List

- [x] Create V16__Add_system_admin_role.sql
- [x] Alter user_info.role enum
- [x] Modify company_id constraint (allow NULL or add system company)
- [x] Add companies.is_suspended column
- [x] Insert system company (id=0)
- [x] Insert system admin user record
- [x] Insert user_auth record with BCrypt hash
- [x] Test migration rollback
- [x] Verify existing data unaffected

## Success Criteria

- Migration runs successfully on clean database
- Migration runs on existing database without errors
- `SELECT * FROM user_info WHERE role='system_admin'` returns 1 record
- System admin user has username `sysadmin`
- companies table has `is_suspended` column
- Rollback works correctly

## Conflict Prevention

**File locks:** None (creates new file)
**Database locks:** Migration runs sequentially via Flyway
**No coordination needed** with other phases during development.

## Risk Assessment

**Risk:** Enum modification may fail on production databases with strict modes
**Mitigation:** Test on staging first, use careful ALTER syntax

**Risk:** BCrypt hash mismatch (different salt)
**Mitigation:** Use pre-generated hash, document password

**Risk:** company_id constraint violation
**Mitigation:** Either make nullable or create special system company

## Security Considerations

- System admin seed password must be changed on first login (document this)
- Default password `admin123` should be flagged for rotation
- Consider adding `must_change_password` flag
- Ensure migration doesn't expose credentials in logs

## Next Steps

After completion:
- Phase 02 can read UserRole enum including `system_admin`
- Phase 04 will verify database changes during integration
- Document seed credentials in deployment guide
