-- =============================================
-- V16__Add_system_admin_role.sql
-- Purpose: Add system_admin role enum value, create system admin seed user,
--          and add company suspension status field
-- Date: 2026-02-06
-- =============================================

-- ============= STEP 1: Modify user_info.role ENUM =============
-- Add 'system_admin' to the role enum
-- Current enum: 'admin', 'manager', 'user'
-- New enum: 'admin', 'manager', 'user', 'system_admin'
ALTER TABLE user_info
MODIFY COLUMN role ENUM('admin', 'manager', 'user', 'system_admin') DEFAULT 'user' NOT NULL;

-- ============= STEP 2: Add is_suspended column to companies =============
-- Use procedure for idempotent migration (add only if not exists)
SET @column_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'companies'
      AND COLUMN_NAME = 'is_suspended'
);

SET @sql = IF(@column_exists = 0,
    'ALTER TABLE companies ADD COLUMN is_suspended BOOLEAN DEFAULT FALSE AFTER is_active',
    'SELECT ''Column is_suspended already exists'' AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============= STEP 3: Create System Company =============
-- Only insert if no system company exists yet (idempotent by unique email)
INSERT IGNORE INTO companies (
    name,
    email,
    phone,
    address,
    tax_code,
    is_active,
    is_suspended,
    country,
    country_flag,
    province,
    ward,
    logo_url
) VALUES (
    'System',
    'system@internal',
    NULL,
    'System Administration Company',
    NULL,
    TRUE,
    FALSE,
    NULL,
    NULL,
    NULL,
    NULL,
    NULL
);

SET @system_company_id = (SELECT id FROM companies WHERE email = 'system@internal' LIMIT 1);

-- ============= STEP 4: Insert System Admin User =============
-- Username: sysadmin | Role: system_admin
-- Password must be set manually via the application after migration
INSERT IGNORE INTO user_info (
    company_id,
    username,
    email,
    full_name,
    phone,
    role,
    birthday,
    address,
    note,
    is_active
) VALUES (
    @system_company_id,
    'sysadmin',
    'admin@system.local',
    'System Administrator',
    NULL,
    'system_admin',
    NULL,
    NULL,
    'System administrator with cross-tenant access',
    TRUE
);

SET @system_admin_id = (SELECT id FROM user_info WHERE username = 'sysadmin' LIMIT 1);

-- ============= STEP 5: Insert User Authentication Record =============
-- BCrypt hash for 'admin123' + salt '4De7AH6dubOTmTOkISE6gw=='
-- Generated via: passwordEncoder.encode("admin123" + "4De7AH6dubOTmTOkISE6gw==")
-- IMPORTANT: Change password on first login
INSERT IGNORE INTO user_auth (
    user_info_id,
    password_hash,
    salt,
    two_factor_enabled,
    two_factor_secret
) VALUES (
    @system_admin_id,
    '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy',
    '4De7AH6dubOTmTOkISE6gw==',
    FALSE,
    NULL
);

-- ============= STEP 6: Add Index for System Admin Queries =============
-- Optimize queries filtering by system_admin role (idempotent)
SET @index_exists = (
    SELECT COUNT(*)
    FROM INFORMATION_SCHEMA.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'user_info'
      AND INDEX_NAME = 'idx_role_system_admin'
);

SET @sql = IF(@index_exists = 0,
    'CREATE INDEX idx_role_system_admin ON user_info(role)',
    'SELECT ''Index idx_role_system_admin already exists'' AS message'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ============= VERIFICATION QUERIES =============
-- Run these queries to verify successful migration:

-- Verify system admin exists:
-- SELECT * FROM user_info WHERE role = 'system_admin';

-- Verify system company exists:
-- SELECT * FROM companies WHERE id = 0;

-- Verify is_suspended column exists:
-- DESCRIBE companies;

-- Verify user_auth for system admin exists:
-- SELECT * FROM user_auth WHERE user_info_id = 0;

-- ============= SECURITY NOTES =============
-- 1. Default password: admin123
-- 2. IMPORTANT: Change password on first login
-- 3. Document this credential in deployment guide
-- 4. Consider adding 'must_change_password' flag in future
